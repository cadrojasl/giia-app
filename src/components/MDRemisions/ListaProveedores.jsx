import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { getProveedores, deleteProveedor } from "services/api";

const ListaProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const res = await getProveedores();
      setProveedores(res.data);
    } catch (error) {
      setErrorMessage("Error al cargar proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleDesactivar = async (id) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteProveedor(id); // DELETE /api/proveedores/{id}
      setSuccessMessage("Proveedor desactivado correctamente.");
      fetchProveedores(); // Recargar lista
    } catch (error) {
      setErrorMessage("Error al desactivar proveedor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Lista de Proveedores
        </MDTypography>

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

        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nombre</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Teléfono</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proveedores.map((prov) => (
                  <TableRow key={prov.id}>
                    <TableCell>{prov.nombre}</TableCell>
                    <TableCell>{prov.email}</TableCell>
                    <TableCell>{prov.telefono}</TableCell>
                    <TableCell align="center">
                      <Button
                        // variant="outlined"
                        color="error"
                        onClick={() => handleDesactivar(prov.id)}
                        disabled={loading}
                      >
                        Desactivar
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

export default ListaProveedores;
