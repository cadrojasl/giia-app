import React, { useState } from "react";
import { Box, Button, MenuItem, Select } from "@mui/material";
// import { QRCodeCanvas } from "qrcode.react";

// Componentes del template
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const RemisionQR = () => {
  const [remision, setRemision] = useState("");
  const remisiones = ["REM-001", "REM-002", "REM-003"];

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    const link = document.createElement("a");
    link.download = `qr-${remision}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} textAlign="center">
          <MDTypography variant="h4" fontWeight="medium">
            Generador de QR
          </MDTypography>
        </MDBox>

        <Box mt={2}>
          <Select
            value={remision}
            onChange={(e) => setRemision(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              Seleccione una remisión
            </MenuItem>
            {remisiones.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {remision && (
          <Box mt={4} textAlign="center">
            {/* <QRCodeCanvas value={`https://miapp.com/remision/${remision}`} size={200} /> */}
            <Box mt={2}>
              <Button variant="contained" color="primary" onClick={handleDownload} sx={{ mr: 2 }}>
                Descargar
              </Button>
              <Button
                color="primary"
                onClick={() => navigator.share({ text: remision })}
              >
                Compartir
              </Button>
            </Box>
          </Box>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default RemisionQR;
