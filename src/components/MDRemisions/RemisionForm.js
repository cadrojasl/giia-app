import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  IconButton,
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
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { createRemision, getProveedores } from "services/api";

const RemisionForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    proveedorId: null,
    nombreProveedor: "",
    nit: "",
    lugarDespacho: "",
    cliente: "",
    direccion: "",
    ciudad: "",
    fecha: new Date().toISOString().split("T")[0],
    elaboradoPor: "",
    recibidoPor: "",
    recibidoSatisfactoriamente: false,
  });

  const [materiales, setMateriales] = useState([]);
  const [rowId, setRowId] = useState(0);

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

  // Manejar cambios en campos del formulario
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Manejar selección de proveedor
  const handleProveedorChange = (event, newValue) => {
    if (newValue) {
      setFormData({
        ...formData,
        proveedorId: newValue.id,
        nombreProveedor: newValue.nombre || newValue.nombreProveedor,
        nit: newValue.nit || "",
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
      });
    }
  };

  // Agregar nueva fila de material
  const handleAddMaterial = () => {
    setMateriales([
      ...materiales,
      {
        id: rowId,
        material: "",
        cantidad: "",
        unidad: "",
      },
    ]);
    setRowId(rowId + 1);
  };

  // Eliminar material
  const handleDeleteMaterial = (id) => {
    setMateriales(materiales.filter((row) => row.id !== id));
  };

  // Actualizar material
  const handleMaterialChange = (id, field, value) => {
    setMateriales(materiales.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

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

    if (!formData.recibidoPor.trim()) {
      newErrors.recibidoPor = "El campo 'Recibido por' es requerido";
    }

    if (materiales.length === 0) {
      newErrors.materiales = "Debe agregar al menos un material";
    } else {
      // Validar que todos los materiales tengan datos completos
      const materialesIncompletos = materiales.some(
        (m) => !m.material.trim() || !m.cantidad || !m.unidad.trim()
      );
      if (materialesIncompletos) {
        newErrors.materiales = "Complete todos los campos de los materiales";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      setErrorMessage("Por favor corrija los errores en el formulario");
      return;
    }

    setLoading(true);

    // Preparar payload para la API
    const payload = {
      proveedorId: formData.proveedorId,
      lugarDespacho: formData.lugarDespacho.trim(),
      cliente: formData.cliente.trim(),
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad.trim(),
      fecha: formData.fecha,
      elaboradoPor: formData.elaboradoPor.trim(),
      recibidoPor: formData.recibidoPor.trim(),
      recibidoSatisfactoriamente: formData.recibidoSatisfactoriamente,
      materiales: materiales.map((m) => ({
        material: m.material.trim(),
        cantidad: parseFloat(m.cantidad),
        unidad: m.unidad.trim(),
      })),
    };

    try {
      const response = await createRemision(payload);
      console.log("Remisión creada:", response.data);

      setSuccessMessage("¡Remisión creada exitosamente!");

      setTimeout(() => {
        navigate("/remisiones");
      }, 2000);
    } catch (error) {
      console.error("Error creando remisión:", error);

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
          setErrorMessage(message || "Error al crear la remisión");
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

  // Limpiar formulario
  const handleLimpiar = () => {
    setFormData({
      proveedorId: null,
      nombreProveedor: "",
      nit: "",
      lugarDespacho: "",
      cliente: "",
      direccion: "",
      ciudad: "",
      fecha: new Date().toISOString().split("T")[0],
      elaboradoPor: "",
      recibidoPor: "",
      recibidoSatisfactoriamente: false,
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
            Crear Remisión
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1}>
            Complete la información de la remisión
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
          {/* Información del Proveedor */}
          <Grid container spacing={2}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NIT"
                name="nit"
                value={formData.nit}
                disabled
                helperText="Se completa automáticamente"
              />
            </Grid>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <MDTypography variant="h6">Materiales</MDTypography>
              <Button
                onClick={handleAddMaterial}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={loading}
              >
                Agregar Material
              </Button>
            </Box>

            {errors.materiales && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.materiales}
              </Alert>
            )}

            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: "40%" }}>Material</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "20%" }}>Cantidad</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "20%" }}>Unidad</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "20%" }} align="center">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materiales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No hay materiales agregados. Haga clic en &quot;Agregar Material&quot; para
                        empezar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    materiales.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={row.material}
                            onChange={(e) =>
                              handleMaterialChange(row.id, "material", e.target.value)
                            }
                            placeholder="Nombre del material"
                            size="small"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            value={row.cantidad}
                            onChange={(e) =>
                              handleMaterialChange(row.id, "cantidad", e.target.value)
                            }
                            placeholder="0"
                            size="small"
                            inputProps={{ min: 0, step: "0.01" }}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={row.unidad}
                            onChange={(e) => handleMaterialChange(row.id, "unidad", e.target.value)}
                            placeholder="kg, m, unidad"
                            size="small"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteMaterial(row.id)}
                            size="small"
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
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
                label="Recibido por *"
                name="recibidoPor"
                value={formData.recibidoPor}
                onChange={handleChange}
                error={!!errors.recibidoPor}
                helperText={errors.recibidoPor}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Checkbox de confirmación */}
          <Box mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.recibidoSatisfactoriamente}
                  onChange={handleChange}
                  name="recibidoSatisfactoriamente"
                  disabled={loading}
                />
              }
              label="Recibido satisfactoriamente"
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
              {loading ? "Guardando..." : "Guardar Remisión"}
            </Button>
          </Box>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default RemisionForm;
