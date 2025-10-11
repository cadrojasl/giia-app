import axios from "axios";
import CryptoJS from "crypto-js";

export const hashPassword = (password) => CryptoJS.SHA256(password).toString();
const usersApi = axios.create({
  baseURL: process.env.REACT_APP_API_USERS_URL,
  headers: { "Content-Type": "application/json" },
});

const dataManagementApi = axios.create({
  baseURL: process.env.REACT_APP_API_DATA_MANAGEMENT_URL,
  headers: { "Content-Type": "application/json" },
});

usersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

dataManagementApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== USUARIOS ====================
export const login = (data) => usersApi.post("/api/usuarios/login", data);
export const createUsuario = (data) => usersApi.post("/api/usuarios", data);

// ==================== PROVEEDORES ====================
export const createProveedor = (data) => usersApi.post("/api/proveedores", data);
export const getProveedores = () => usersApi.get("/api/proveedores");
export const getProveedor = (id) => usersApi.get(`/api/proveedores/${id}`);
export const updateProveedor = (id, data) => usersApi.put(`/api/proveedores/${id}`, data);
export const deleteProveedor = (id) => usersApi.delete(`/api/proveedores/${id}`);

// ==================== REMISIONES ====================
export const createRemision = (data) => usersApi.post("/api/remisiones", data);
export const getRemisiones = () => usersApi.get("/api/remisiones");
export const getRemision = (id) => usersApi.get(`/api/remisiones/${id}`);
export const updateRemision = (id, data) => usersApi.put(`/api/remisiones/${id}`, data);
export const deleteRemision = (id) => usersApi.delete(`/api/remisiones/${id}`);

// Filtrar remisiones por proveedor
export const getRemisionesByProveedor = (proveedorId) =>
  usersApi.get(`/api/remisiones/proveedor/${proveedorId}`);

// Filtrar remisiones por fecha
export const getRemisionesByDateRange = (fechaInicio, fechaFin) =>
  usersApi.get("/api/remisiones/fecha", { params: { fechaInicio, fechaFin } });

// ==================== DATA MANAGEMENT ====================
export const refreshProveedores = () => dataManagementApi.get("/proveedores/refresh");
export const sseSubscribe = () => {
  return new EventSource(`${process.env.REACT_APP_API_DATA_MANAGEMENT_URL}/stream/proveedores`);
};

// ==================== MATERIALES ====================
export const getMaterialesByProveedor = (proveedorId) =>
  usersApi.get(`/api/materiales/proveedor/${proveedorId}`);

// ==================== ALMACEN ====================
export const createEntrada = (data) => usersApi.post("/api/entradas", data);
export const createSalida = (data) => usersApi.post("/api/salidas", data);

// ==================== UTILIDADES ====================
// Función para manejar errores de manera consistente
export const handleApiError = (error) => {
  if (error.response) {
    // Error del servidor
    const { status, data } = error.response;
    const message = data?.message || data?.error || "Error en el servidor";
    switch (status) {
      case 400:
        return { error: "Datos inválidos", details: message };
      case 401:
        return { error: "No autorizado", details: "Sesión expirada" };
      case 403:
        return { error: "Acceso denegado", details: message };
      case 404:
        return { error: "Recurso no encontrado", details: message };
      case 409:
        return { error: "Conflicto", details: "El recurso ya existe" };
      case 500:
        return { error: "Error del servidor", details: message };
      default:
        return { error: "Error desconocido", details: message };
    }
  } else if (error.request) {
    // Error de conexión
    return { error: "Error de conexión", details: "No se pudo conectar con el servidor" };
  } else {
    // Error de configuración
    return { error: "Error inesperado", details: error.message || "Ocurrió un error" };
  }
};

// Función para validar token
export const validateToken = async () => {
  try {
    await usersApi.get("/api/usuarios/validate");
    return true;
  } catch (error) {
    return false;
  }
};

// Función para logout
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
};
