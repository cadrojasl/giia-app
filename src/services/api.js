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

export const login = (data) => usersApi.post("/api/usuarios/login", data);
export const createProveedor = (data) => usersApi.post("/api/proveedores", data);
export const getProveedores = () => usersApi.get("/api/proveedores");
export const getProveedor = (id) => usersApi.get(`/api/proveedores/${id}`);
export const updateProveedor = (id, data) => usersApi.put(`/api/proveedores/${id}`, data);
export const deleteProveedor = (id) => usersApi.delete(`/api/proveedores/${id}`);

export const refreshProveedores = () => dataManagementApi.get("/proveedores/refresh");
export const sseSubscribe = () => {
  return new EventSource(`${process.env.REACT_APP_API_DATA_MANAGEMENT_URL}/stream/proveedores`);
};
