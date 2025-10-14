import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Alert,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { getUsuario, getMateriales, createRemision } from "services/api";

const SalidaForm = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [salidaItems, setSalidaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const usuarioId = parseInt(localStorage.getItem("usuarioId"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarioRes = await getUsuario(usuarioId);
        setUsuario(usuarioRes.data);

        const materialesRes = await getMateriales();
        setMateriales(materialesRes.data);
      } catch (error) {
        setErrorMessage("Error al cargar datos.");
      }
    };

    fetchData();
  }, [usuarioId]);

  const handleAddItem = () => {
    if (!materialSeleccionado || !cantidad) {
      setErrorMessage("Completa todos los campos del material.");
      return;
    }

    setSalidaItems([
      ...salidaItems,
      {
        id: materialSeleccionado.id,
        nombre: materialSeleccionado.nombre,
        cantidad,
      },
    ]);

    setMaterialSeleccionado(null);
    setCantidad("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const salidaPayload = {
        tipo: `1`,
        usuarioId: usuario.id,
        observaciones,
        materiales: salidaItems.map((item) => ({
          materialId: item.id,
          cantidad: Number(item.cantidad),
        })),
      };

      const res = await createRemision(salidaPayload);
      const salidaId = res.data.id;

      const qrUrl = `http://giia-backend.eastus.cloudapp.azure.com:8082/api/remisiones/qr/${salidaId}`;
      setTimeout(() => {
        window.open(qrUrl, "_blank");
      }, 2000);

      setSuccessMessage("Salida registrada exitosamente.");
      setSalidaItems([]);
      setObservaciones("");
    } catch (error) {
      setErrorMessage("Error al registrar la salida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Registrar Salida
        </MDTypography>

        {usuario && (
          <Box mb={2}>
            <Typography variant="subtitle1">Usuario:</Typography>
            <Typography variant="body1">{usuario.nombre}</Typography>
            <Typography variant="body2" color="text.secondary">
              {usuario.email} | {usuario.cargo}
            </Typography>
          </Box>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={materiales}
                getOptionLabel={(option) => option.nombre}
                value={materialSeleccionado}
                onChange={(e, value) => setMaterialSeleccionado(value)}
                renderInput={(params) => <TextField {...params} label="Material" fullWidth />}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Cantidad"
                type="number"
                fullWidth
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleAddItem} disabled={loading}>
                Agregar Material
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                fullWidth
                multiline
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Materiales agregados:</Typography>
              {salidaItems.length === 0 ? (
                <Typography color="text.secondary">No hay materiales aún.</Typography>
              ) : (
                salidaItems.map((item, index) => (
                  <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                    <Typography>
                      {item.nombre} - {item.cantidad}
                    </Typography>
                  </Box>
                ))
              )}
            </Grid>

            <Grid item xs={12} textAlign="right">
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? "Generando..." : "Registrar Salida y QR"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default SalidaForm;
