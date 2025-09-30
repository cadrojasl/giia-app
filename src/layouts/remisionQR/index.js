import React, { useState } from "react";
import { Box, Button, MenuItem, Paper, Select, Typography } from "@mui/material";
//import { QRCodeCanvas } from "qrcode.react";

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
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Generador de QR
      </Typography>

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
              variant="outlined"
              color="secondary"
              onClick={() => navigator.share({ text: remision })}
            >
              Compartir
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RemisionQR;
