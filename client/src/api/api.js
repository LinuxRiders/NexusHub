import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./authService";

const BASE_URL = import.meta.env.VITE_SERVER;

// Variables para manejar race conditions al refrescar tokens
let isRefreshing = false;
let failedQueue = [];
const MAX_REFRESH_RETRIES = 1; // Limite de retries por solicitud

/**
 * Procesa la cola de solicitudes pendientes mientras se renueva el token
 * @param {Error|null} error - Error recibido durante refresh
 * @param {string|null} token - Nuevo access token si fue exitoso
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Crear instancia Axios para la API
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true, // Necesario para cookies HttpOnly
});

// Interceptor de request: agregar Authorization header si existe accessToken
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: manejar 401 y refrescar token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // Limitar retries
      if (!originalRequest._retryCount) originalRequest._retryCount = 0;
      if (originalRequest._retryCount >= MAX_REFRESH_RETRIES) {
        clearAccessToken();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Si ya hay un refresh en curso, encolar la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retryCount += 1;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newAccessToken = data.access_token;

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
