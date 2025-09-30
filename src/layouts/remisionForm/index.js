import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
//import { DataGrid } from "@mui/x-data-grid";

const RemisionForm = () => {
  const [rows, setRows] = useState([]);
  const [rowId, setRowId] = useState(0);

  const columns = [
    { field: "material", headerName: "Material", flex: 1, editable: true },
    { field: "cantidad", headerName: "Cantidad", flex: 1, editable: true },
    { field: "unidad", headerName: "Unidad", flex: 1, editable: true },
  ];

  const handleAddRow = () => {
    setRows([...rows, { id: rowId, material: "", cantidad: "", unidad: "" }]);
    setRowId(rowId + 1);
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Crear Remisión
      </Typography>
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

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Materiales
        </Typography>
        <Button onClick={handleAddRow} variant="contained" sx={{ mb: 2 }}>
          Agregar Material
        </Button>
        <div style={{ height: 300, width: "100%" }}>
          {/* <DataGrid rows={rows} columns={columns} experimentalFeatures={{ newEditingApi: true }} /> */}
        </div>
      </Box>

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
    </Paper>
  );
};

export default RemisionForm;
