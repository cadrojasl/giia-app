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
  Paper,
  Divider,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  leerRemision,
  getMaterialesPorRemision,
  actualizarEstadoRemision,
  incrementarStock,
  decrementarStock,
  getUsuario,
} from "services/api";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";

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
        if (remisionData.tipo === "false") {
          await incrementarStock(stockPayload);
        } else {
          await decrementarStock(stockPayload);
        }
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Informe de Remisión", 14, 20);

        doc.setFontSize(12);
        doc.text(`ID Remisión: ${remisionId}`, 14, 30);
        doc.text(`Tipo: ${remisionData.tipo === 1 ? "Salida" : "Entrada"}`, 14, 38);
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 46);
        doc.text(`Observaciones: ${observaciones || "Ninguna"}`, 14, 54);

        autoTable(doc, {
          startY: 64,
          head: [["Material ID", "Cantidad"]],
          body: materiales.map((mat) => [mat.materialId, mat.cantidad]),
        });

        const user = parseInt(localStorage.getItem("usuarioId"));
        let usuarioNombre = "Usuario";

        try {
          const usuarioRes = await getUsuario(user);
          usuarioNombre = usuarioRes.data?.nombre || "Usuario";
        } catch (error) {
          console.warn("No se pudo obtener el nombre del usuario.");
        }
        doc.text(`\n\nAceptado por: ${usuarioNombre}`, 14, doc.lastAutoTable.finalY + 20);

        doc.save(`remision_${remisionId}.pdf`);
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
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                  <MDTypography variant="h5" gutterBottom>
                    Detalles de la Remisión
                  </MDTypography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>ID:</strong> {remisionData.id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tipo:</strong> {remisionData.tipo === 1 ? 'Salida' : 'Entrada'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Estado:</strong> {remisionData.estado || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Usuario ID:</strong> {remisionData.usuarioId}
                      </Typography>
                      {remisionData.proveedorId && (
                        <Typography variant="body2">
                          <strong>Proveedor ID:</strong> {remisionData.proveedorId}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Fecha:</strong>{' '}
                        {remisionData.fechaCreacion
                          ? new Date(remisionData.fechaCreacion).toLocaleString()
                          : 'No disponible'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Observaciones:</strong> {remisionData.observaciones || 'Ninguna'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {materiales.length > 0 && (
              <Grid item xs={12}>
                <MDTypography variant="h6" gutterBottom>
                  Materiales
                </MDTypography>
                <TableContainer component={Paper} elevation={3} sx={{ maxWidth: 340 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>ID Material</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Cantidad</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {materiales.map((mat, index) => (
                        <TableRow key={index}>
                          <TableCell>{mat.materialId}</TableCell>
                          <TableCell>{mat.cantidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
