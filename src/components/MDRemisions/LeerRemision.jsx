import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import {
  leerRemision,
  getMaterialesPorRemision,
  actualizarEstadoRemision,
  incrementarStock,
} from "services/api";

const LeerRemisionConEstado = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remisionId, setRemisionId] = useState(null);
  const [remisionData, setRemisionData] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setRemisionData(null);
      setMateriales([]);
      setRemisionId(null);
      setErrorMessage("");
      setSuccessMessage("");
    }
  };

  const handleLeerQR = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Debes seleccionar un archivo.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await leerRemision(formData);
      const id = res.data.id;
      setRemisionId(id);
      setRemisionData(res.data);

      const matRes = await getMaterialesPorRemision(id);
      setMateriales(matRes.data);
    } catch (error) {
      setErrorMessage("Error al leer el QR o consultar materiales.");
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarEstado = async (estadoId) => {
    if (!remisionId) return;

    setLoading(true);
    try {
      await actualizarEstadoRemision(remisionId, {
        estadoId,
        observaciones,
      });
      if (estadoId === 3) {
        const stockPayload = materiales.map((mat) => ({
          materialId: mat.materialId,
          cantidad: mat.cantidad,
        }));
        await incrementarStock(x);
      }

      setSuccessMessage("Estado actualizado correctamente.");
    } catch (error) {
      setErrorMessage("Error al actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Leer Remisión y Actualizar Estado
        </MDTypography>

        <Box component="form" onSubmit={handleLeerQR}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : "Leer QR"}
              </Button>
            </Grid>

            {errorMessage && (
              <Grid item xs={12}>
                <Alert severity="error">{errorMessage}</Alert>
              </Grid>
            )}

            {remisionData && (
              <Grid item xs={12}>
                <MDTypography variant="h6">Datos de la Remisión:</MDTypography>
                <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                  {Object.entries(remisionData).map(([key, value]) => (
                    <Typography key={key}>
                      <strong>{key}:</strong>{" "}
                      {typeof value === "object" ? JSON.stringify(value) : value.toString()}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            )}

            {materiales.length > 0 && (
              <Grid item xs={12}>
                <MDTypography variant="h6">Materiales:</MDTypography>
                <List>
                  {materiales.map((mat, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`ID ${mat.materialId} - cantidad ${mat.cantidad}`} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}

            {remisionId && (
              <>
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

                <Grid item xs={12} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleActualizarEstado(3)}
                    disabled={loading}
                  >
                    Aprobado
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleActualizarEstado(2)}
                    disabled={loading}
                  >
                    Aprobado Parcial
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleActualizarEstado(4)}
                    disabled={loading}
                  >
                    Rechazado
                  </Button>
                </Grid>
              </>
            )}

            {successMessage && (
              <Grid item xs={12}>
                <Alert severity="success">{successMessage}</Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default LeerRemisionConEstado;
