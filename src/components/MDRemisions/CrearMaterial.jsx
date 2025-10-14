import React, { useState, useEffect } from "react";
import { Box, Button, Grid, TextField, Alert, Autocomplete, CircularProgress } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { createMaterial, getCategorias } from "services/api";

const CrearMaterial = () => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    unidadMedida: "",
    categoria: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(res.data);
      } catch (error) {
        setErrorMessage("Error al cargar categorías.");
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const generarBarcode = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!form.categoria) {
        setErrorMessage("Debes seleccionar una categoría.");
        setLoading(false);
        return;
      }

      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        unidadMedida: form.unidadMedida,
        categoriaId: form.categoria.id,
        barcode: generarBarcode(),
        activo: true,
      };

      await createMaterial(payload);
      setSuccessMessage("Material creado exitosamente.");
      setForm({
        nombre: "",
        descripcion: "",
        unidadMedida: "",
        categoria: null,
      });
    } catch (error) {
      setErrorMessage("Error al crear material.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Crear Material
        </MDTypography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre"
                fullWidth
                value={form.nombre}
                onChange={handleChange("nombre")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Unidad de Medida"
                fullWidth
                value={form.unidadMedida}
                onChange={handleChange("unidadMedida")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={4}
                value={form.descripcion}
                onChange={handleChange("descripcion")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={categorias}
                getOptionLabel={(option) => option.nombre}
                value={form.categoria}
                onChange={(e, value) => setForm({ ...form, categoria: value })}
                renderInput={(params) => <TextField {...params} label="Categoría" fullWidth />}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} textAlign="right">
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : "Crear Material"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default CrearMaterial;
