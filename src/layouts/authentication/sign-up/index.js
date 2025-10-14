/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Card,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Services
import { createProveedor } from "services/api";
import { hashPassword } from "services/api";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function Cover() {
  const [formData, setFormData] = useState({
    nit: "",
    nombre: "",
    direccion: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    if (errorMessage) {
      setErrorMessage(""); // Clear API errors when user types
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nit.trim()) {
      newErrors.nit = "El NIT es requerido";
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = "Ingrese un correo válido";
    }

    const phoneRegex = /^[0-9]{7,10}$/;
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!phoneRegex.test(formData.telefono)) {
      newErrors.telefono = "Ingrese un teléfono válido (7-10 dígitos)";
    }

    if (!formData.contrasena) {
      newErrors.contrasena = "La contraseña es requerida";
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Confirme la contraseña";
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    if (validateForm()) {
      const data = {
        nit: formData.nit,
        nombreProveedor: formData.nombre,
        emailProveedor: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        usuario: formData.nombre.toLowerCase().replace(/\s/g, ""),
        nombreUsuario: formData.nombre,
        emailUsuario: formData.correo,
        passwordHash: hashPassword(formData.contrasena),
      };

      try {
        await createProveedor(data);
        setSuccessMessage("¡Proveedor creado exitosamente!");
        setTimeout(() => {
          handleLimpiar();
          setSuccessMessage("");
          navigate("/authentication/sign-in");
        }, 2000);
      } catch (error) {
        console.error("Error creando proveedor:", error);
        setErrorMessage(
          error.response?.data?.message ||
            "Error al crear el proveedor. Intente de nuevo.(posiblemente datos repetidos)"
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData({
      nit: "",
      nombre: "",
      direccion: "",
      correo: "",
      telefono: "",
      contrasena: "",
      confirmarContrasena: "",
    });
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Registrar Proveedor
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Complete los datos del nuevo proveedor
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="NIT"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  error={!!errors.nit}
                  helperText={errors.nit}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Nombre del Proveedor"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  fullWidth
                  variant="standard"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  error={!!errors.direccion}
                  helperText={errors.direccion}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="email"
                  label="Correo Electrónico"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  error={!!errors.correo}
                  helperText={errors.correo}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={!!errors.telefono}
                  helperText={errors.telefono}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type={showPassword ? "text" : "password"}
                  label="Contraseña"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  error={!!errors.contrasena}
                  helperText={errors.contrasena}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword} edge="end" disabled={loading}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirmar Contraseña"
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  error={!!errors.confirmarContrasena}
                  helperText={errors.confirmarContrasena}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                          disabled={loading}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <MDBox mt={4} mb={1} display="flex" gap={2}>
              <MDButton
                variant="outlined"
                color="info"
                onClick={handleLimpiar}
                disabled={loading}
                fullWidth
              >
                Limpiar
              </MDButton>
              <MDButton variant="gradient" color="info" type="submit" disabled={loading} fullWidth>
                {loading ? "Registrando..." : "Registrar Proveedor"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                ¿Ya tiene una cuenta?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Iniciar Sesión
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
