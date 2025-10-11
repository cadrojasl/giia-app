import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Alert,
  Autocomplete,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { createSalida, getProveedores, getMaterialesByProveedor } from "services/api";

const SalidaAlmacenForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    empresa: "",
    proveedorId: null,
    nombreProveedor: "",
    nit: "",
    direccionProveedor: "",
    emailProveedor: "",
    telefonoProveedor: "",
    lugarDespacho: "",
    cliente: "",
    direccion: "",
    ciudad: "",
    fecha: new Date().toISOString().split("T")[0],
    elaboradoPor: "",
    entregadoPor: "",
    entregadoSatisfactoriamente: false,
  });

  const [materiales, setMateriales] = useState([]);

  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    setLoadingProveedores(true);
    try {
      const response = await getProveedores();
      setProveedores(response.data || []);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setErrorMessage("Error al cargar la lista de proveedores");
    } finally {
      setLoadingProveedores(false);
    }
  };

  // Fetch materials when provider changes
  useEffect(() => {
    if (formData.proveedorId) {
      const fetchMateriales = async () => {
        try {
          const response = await getMaterialesByProveedor(formData.proveedorId);
          setMateriales(response.data || []);
        } catch (error) {
          console.error("Error cargando materiales:", error);
          setErrorMessage("Error al cargar los materiales del proveedor");
          setMateriales([]);
        }
      };
      fetchMateriales();
    } else {
      setMateriales([]);
    }
  }, [formData.proveedorId]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleProveedorChange = (event, newValue) => {
    if (newValue) {
      setFormData({
        ...formData,
        proveedorId: newValue.id,
        nombreProveedor: newValue.nombre || newValue.nombreProveedor || "",
        nit: newValue.nit || "",
        direccionProveedor: newValue.direccion || "",
        emailProveedor: newValue.emailProveedor || newValue.correo || "",
        telefonoProveedor: newValue.telefono || "",
      });
      if (errors.proveedorId) {
        setErrors({ ...errors, proveedorId: "" });
      }
    } else {
      setFormData({
        ...formData,
        proveedorId: null,
        nombreProveedor: "",
        nit: "",
        direccionProveedor: "",
        emailProveedor: "",
        telefonoProveedor: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.empresa.trim()) {
      newErrors.empresa = "El nombre de la empresa es requerido";
    }

    if (!formData.proveedorId) {
      newErrors.proveedorId = "El proveedor es requerido";
    }

    if (!formData.lugarDespacho.trim()) {
      newErrors.lugarDespacho = "El lugar de despacho es requerido";
    }

    if (!formData.cliente.trim()) {
      newErrors.cliente = "El cliente es requerido";
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = "La ciudad es requerida";
    }

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida";
    }

    if (!formData.elaboradoPor.trim()) {
      newErrors.elaboradoPor = "El campo 'Elaborado por' es requerido";
    }

    if (!formData.entregadoPor.trim()) {
      newErrors.entregadoPor = "El campo 'Entregado por' es requerido";
    }

    if (materiales.length === 0) {
      newErrors.materiales = "No hay materiales disponibles para este proveedor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      setErrorMessage("Por favor corrija los errores en el formulario");
      return;
    }

    setLoading(true);

    const payload = {
      empresa: formData.empresa.trim(),
      proveedorId: formData.proveedorId,
      lugarDespacho: formData.lugarDespacho.trim(),
      cliente: formData.cliente.trim(),
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad.trim(),
      fecha: formData.fecha,
      elaboradoPor: formData.elaboradoPor.trim(),
      entregadoPor: formData.entregadoPor.trim(),
      entregadoSatisfactoriamente: formData.entregadoSatisfactoriamente,
      materiales: materiales.map((m) => ({
        material: m.material,
        cantidad: parseFloat(m.cantidad),
        unidad: m.unidad,
      })),
    };

    try {
      const response = await createSalida(payload);
      console.log("Salida creada:", response.data);

      setSuccessMessage("¡Salida de almacén creada exitosamente!");

      setTimeout(() => {
        navigate("/salidas");
      }, 2000);
    } catch (error) {
      console.error("Error creando salida:", error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        if (status === 400) {
          setErrorMessage(message || "Datos inválidos. Verifique la información");
        } else if (status === 404) {
          setErrorMessage("Proveedor no encontrado");
        } else if (status === 500) {
          setErrorMessage("Error en el servidor. Intente más tarde");
        } else {
          setErrorMessage(message || "Error al crear la salida");
        }
      } else if (error.request) {
        setErrorMessage("No se pudo conectar con el servidor");
      } else {
        setErrorMessage("Error inesperado. Intente de nuevo");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData({
      empresa: "",
      proveedorId: null,
      nombreProveedor: "",
      nit: "",
      direccionProveedor: "",
      emailProveedor: "",
      telefonoProveedor: "",
      lugarDespacho: "",
      cliente: "",
      direccion: "",
      ciudad: "",
      fecha: new Date().toISOString().split("T")[0],
      elaboradoPor: "",
      entregadoPor: "",
      entregadoSatisfactoriamente: false,
    });
    setMateriales([]);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} textAlign="center">
          <MDTypography variant="h4" fontWeight="medium">
            Crear Salida de Almacén
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1}>
            Complete la información de la salida
          </MDTypography>
        </MDBox>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Nombre de la Empresa */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Empresa *"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                error={!!errors.empresa}
                helperText={errors.empresa}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Información del Proveedor */}
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => option.nombre || option.nombreProveedor || ""}
                loading={loadingProveedores}
                onChange={handleProveedorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Proveedor *"
                    error={!!errors.proveedorId}
                    helperText={errors.proveedorId}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingProveedores ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Datos completos del Proveedor */}
          {formData.proveedorId && (
            <MDBox mt={2}>
              <MDTypography variant="h6" mb={1}>
                Datos del Proveedor
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Proveedor"
                    value={formData.nombreProveedor}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="NIT"
                    value={formData.nit}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    value={formData.direccionProveedor}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    value={formData.emailProveedor}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={formData.telefonoProveedor}
                    disabled
                  />
                </Grid>
              </Grid>
            </MDBox>
          )}

          {/* Otros campos */}
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lugar de Despacho *"
                name="lugarDespacho"
                value={formData.lugarDespacho}
                onChange={handleChange}
                error={!!errors.lugarDespacho}
                helperText={errors.lugarDespacho}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cliente *"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                error={!!errors.cliente}
                helperText={errors.cliente}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dirección *"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                error={!!errors.direccion}
                helperText={errors.direccion}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ciudad *"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                error={!!errors.ciudad}
                helperText={errors.ciudad}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                label="Fecha *"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                error={!!errors.fecha}
                helperText={errors.fecha}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Sección de Materiales */}
          <MDBox mt={4}>
            <MDTypography variant="h6" mb={2}>
              Materiales
            </MDTypography>

            {errors.materiales && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.materiales}
              </Alert>
            )}

            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: "50%" }}>Material</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "25%" }}>Cantidad</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "25%" }}>Unidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materiales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No hay materiales disponibles. Seleccione un proveedor.
                      </TableCell>
                    </TableRow>
                  ) : (
                    materiales.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.material}</TableCell>
                        <TableCell>{row.cantidad}</TableCell>
                        <TableCell>{row.unidad}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </MDBox>

          {/* Información de Responsables */}
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Elaborado por *"
                name="elaboradoPor"
                value={formData.elaboradoPor}
                onChange={handleChange}
                error={!!errors.elaboradoPor}
                helperText={errors.elaboradoPor}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Entregado por *"
                name="entregadoPor"
                value={formData.entregadoPor}
                onChange={handleChange}
                error={!!errors.entregadoPor}
                helperText={errors.entregadoPor}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Checkbox de confirmación */}
          <Box mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.entregadoSatisfactoriamente}
                  onChange={handleChange}
                  name="entregadoSatisfactoriamente"
                  disabled={loading}
                />
              }
              label="Entregado satisfactoriamente"
            />
          </Box>

          {/* Botones de acción */}
          <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLimpiar}
              disabled={loading}
              size="large"
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? "Guardando..." : "Guardar Salida"}
            </Button>
          </Box>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default SalidaAlmacenForm;
