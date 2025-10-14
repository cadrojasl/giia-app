import React, { useState } from "react";
import { Box, Button, Grid, Typography, Alert, CircularProgress, TextField } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { leerRemision } from "services/api";

const LeerRemision = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponseData(null);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Debes seleccionar un archivo.");
      return;
    }

    console.log("🔍 DEBUG - File object:", file);
    console.log("🔍 DEBUG - File type:", file.type);
    setLoading(true);
    setErrorMessage("");
    setResponseData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await leerRemision(formData);
      setResponseData(res.data);
    } catch (error) {
      setErrorMessage("Error al leer el archivo. Verifica que sea un QR válido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Leer Remisión desde QR
        </MDTypography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : "Leer Remisión"}
              </Button>
            </Grid>

            {errorMessage && (
              <Grid item xs={12}>
                <Alert severity="error">{errorMessage}</Alert>
              </Grid>
            )}

            {responseData && (
              <Grid item xs={12}>
                <MDTypography variant="h6" mb={1}>
                  Datos de la Remisión:
                </MDTypography>
                <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                  {Object.entries(responseData).map(([key, value]) => (
                    <Typography key={key}>
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default LeerRemision;
