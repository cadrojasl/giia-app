import React, { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";

// Componentes del template
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const RemisionForm = () => {
  const [rows, setRows] = useState([]);
  const [rowId, setRowId] = useState(0);

  const handleAddRow = () => {
    setRows([...rows, { id: rowId, material: "", cantidad: "", unidad: "" }]);
    setRowId(rowId + 1);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} textAlign="center">
          <MDTypography variant="h4" fontWeight="medium">
            Crear Remisión
          </MDTypography>
        </MDBox>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth label="Nombre Proveedor" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="NIT" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Lugar de Despacho" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Cliente" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Dirección" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Ciudad" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Fecha" />
          </Grid>
        </Grid>

        <MDBox mt={4}>
          <MDTypography variant="h6" gutterBottom>
            Materiales
          </MDTypography>
          <Button onClick={handleAddRow} variant="contained" sx={{ mb: 2 }}>
            Agregar Material
          </Button>
          <div style={{ height: 300, width: "100%" }}>
            {/* <DataGrid rows={rows} columns={columns} /> */}
          </div>
        </MDBox>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <TextField fullWidth label="Elaborado por" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Recibido por" />
          </Grid>
        </Grid>

        <Box mt={2}>
          <FormControlLabel control={<Checkbox />} label="Recibido satisfactoriamente" />
        </Box>

        <Box mt={3}>
          <Button variant="contained" color="primary">
            Guardar Remisión
          </Button>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default RemisionForm;
