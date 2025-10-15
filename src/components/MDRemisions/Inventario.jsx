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

import { getStock, getMaterial } from "services/api";

const Inventario = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await getStock();
      const itemsList = res.data;

      // 1. Por cada elemento, consumir la API que trae el detalle.
      const detailedItemsPromises = itemsList.map(async (item) => {
        const detailResponse = await getMaterial(item.materialId);
        const itemDetail = detailResponse.data;
        // Combinar la información del detalle con el objeto original.
        return { ...item, ...itemDetail };
      });
      // Esperar a que todas las promesas se resuelvan.
      const detailedItems = await Promise.all(detailedItemsPromises);
      setStock(detailedItems);
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
                { Header: "Id", accessor: "materialId", width: "10%" },
                { Header: "Material", accessor: "nombre", width: "40%" },
                { Header: "Stock", accessor: "cantidadActual", width: "10%" },
                { Header: "Minimo", accessor: "stockMinimo", width: "10%" },
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
