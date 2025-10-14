import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { getMateriales, deleteMaterial } from "services/api";

const ListaMateriales = () => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMateriales = async () => {
    setLoading(true);
    try {
      const res = await getMateriales();
      setMateriales(res.data);
    } catch (error) {
      setErrorMessage("Error al cargar materiales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales();
  }, []);

  const handleEliminar = async (id) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteMaterial(id);
      setSuccessMessage("Material eliminado correctamente.");
      fetchMateriales();
    } catch (error) {
      setErrorMessage("Error al eliminar material.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Lista de Materiales
        </MDTypography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {loading ? (
          <Box textAlign="center" mt={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead align="cencter">
                <TableRow>
                  <TableCell>
                    <strong>Nombre</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Unidad</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Categoría</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Barcode</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Accion</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materiales.map((mat) => (
                  <TableRow key={mat.id}>
                    <TableCell>{mat.nombre}</TableCell>
                    <TableCell>{mat.unidadMedida}</TableCell>
                    <TableCell>{mat.categoriaId}</TableCell>
                    <TableCell>{mat.barcode}</TableCell>
                    <TableCell align="center">
                      <Button
                        //variant="outlined"
                        color="error"
                        onClick={() => handleEliminar(mat.id)}
                        disabled={loading}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default ListaMateriales;
