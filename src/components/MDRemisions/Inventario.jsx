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
import DataTable from "examples/Tables/DataTable";

import { getStock } from "services/api";

const Inventario = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await getStock();
      setStock(res.data);
    } catch (error) {
      setErrorMessage("Error al cargar stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Inventario
        </MDTypography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {loading ? (
          <Box textAlign="center" mt={3}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            table={{
              columns: [
                { Header: "Id", accessor: "materialId", width: "20%" },
                { Header: "Stock", accessor: "cantidadActual", width: "20%" },
                { Header: "Minimo", accessor: "stockMinimo", width: "20%" },
                { Header: "Ubicacion", accessor: "ubicacion" },
              ],
              rows: stock,
            }}
          />
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default Inventario;
