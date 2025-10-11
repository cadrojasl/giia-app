import React, { useState } from "react";
import { Box, Button, Grid, TextField, IconButton, InputAdornment, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { createUsuario, hashPassword } from "services/api";

const UsuarioForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    nombre: "",
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
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
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
        username: formData.username,
        nombre: formData.nombre,
        email: formData.correo,
        telefono: formData.telefono,
        passwordHash: hashPassword(formData.contrasena),
      };

      try {
        await createUsuario(data);
        setSuccessMessage("¡Usuario creado exitosamente!");
        setTimeout(() => {
          handleLimpiar();
          setSuccessMessage("");
          navigate("/usuarios");
        }, 2000);
      } catch (error) {
        console.error("Error creando usuario:", error);
        setErrorMessage(
          error.response?.data?.message || "Error al crear el usuario. Intente de nuevo."
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
      username: "",
      nombre: "",
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
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} textAlign="center">
          <MDTypography variant="h4" fontWeight="medium">
            Crear Usuario
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1}>
            Complete los datos del nuevo usuario
          </MDTypography>
        </MDBox>

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

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                placeholder="Ej: usuario123"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                placeholder="Ingrese el nombre completo"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                error={!!errors.correo}
                helperText={errors.correo}
                placeholder="ejemplo@correo.com"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                error={!!errors.telefono}
                helperText={errors.telefono}
                placeholder="3001234567"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contraseña"
                name="contrasena"
                type={showPassword ? "text" : "password"}
                value={formData.contrasena}
                onChange={handleChange}
                error={!!errors.contrasena}
                helperText={errors.contrasena}
                disabled={loading}
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
              <TextField
                fullWidth
                label="Confirmar Contraseña"
                name="confirmarContrasena"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmarContrasena}
                onChange={handleChange}
                error={!!errors.confirmarContrasena}
                helperText={errors.confirmarContrasena}
                disabled={loading}
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

          <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
            <Button color="primary" onClick={handleLimpiar} size="large" disabled={loading}>
              Limpiar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar Usuario"}
            </Button>
          </Box>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
};

export default UsuarioForm;
