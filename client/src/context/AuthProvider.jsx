import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../api/authService";
import { jwtDecode } from "jwt-decode";

// Contexto con valores por defecto
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  permissions: null,
  roles: null,
  login: async () => {},
  logout: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Obtiene información del usuario actualmente autenticado
   */
  const fetchUser = async () => {
    const decoded = jwtDecode(getAccessToken());
    setUser(decoded.user_id);
    setRoles(decoded.roles || []);
    setPermissions(decoded.permissions || []);

    try {
      const { data } = await api.get("/users/me");
      // const { data: userData } = await api.get("/userdata/me");

      // setUser({ ...data.data, ...userData.data });
      setUser(data.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Inicializa autenticación al cargar la app
   * - Si no hay access token en memoria, intenta refrescar usando cookie HttpOnly
   * - Si ya hay access token, solo valida usuario
   */
  const initializeAuth = async () => {
    const token = getAccessToken();

    try {
      if (!token) {
        // No hay access token, intentamos refrescar
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.access_token);
      }

      // Si hay token (nuevo o existente), obtenemos datos del usuario
      await fetchUser();
      setIsAuthenticated(true);
    } catch (error) {
      // Si falla el refresh o el fetch, limpiamos todo
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Login con email y password
   * - Almacena accessToken en memoria
   * - Obtiene info de usuario
   */
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Guardar accessToken en memoria y en contexto
      setAccessToken(data.access_token);

      // Obtener información del usuario
      await fetchUser();
    } catch (error) {
      console.error("Error en login:", error.response?.data || error.message);

      // Lanza un error con mensaje claro para el componente de login
      throw new Error(
        error.response?.data?.error || "No se pudo iniciar sesión"
      );
    }
  };

  /**
   * Logout del usuario
   * - Revoca refresh token en backend
   * - Limpia accessToken y estado local
   */
  const logout = async () => {
    try {
      if (isAuthenticated) {
        await api.post("/auth/logout");
      }
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Verifica permisos del usuario
   * @param {string|string[]} requiredPerms - Ej: 'users:read' o ['org:teams:users:read','roles:assign']
   * @param {'OR'|'AND'} mode
   */
  const hasPermission = (requiredPerms, mode = "OR") => {
    if (!permissions.length) return false;

    const permsRequested = Array.isArray(requiredPerms)
      ? requiredPerms
      : [requiredPerms];

    const parsedPerms = permsRequested
      .map((p) => {
        if (typeof p === "string") {
          // soporta module1:module2:...:moduleN:action
          const parts = p.toLowerCase().split(":").map((s) => s.trim()).filter(Boolean);
          if (parts.length === 0) return null;
          if (parts.length === 1) {
            // caso raro: solo acción o solo módulo -> no válido
            return null;
          }
          const action = parts[parts.length - 1];
          const module = parts.slice(0, parts.length - 1).join(":");
          return { module, action };
        }
        // si ya es objeto { module, action }
        return p;
      })
      .filter((p) => p && p.module && p.action);

    if (!parsedPerms.length) return false;

    const modeUpper = mode.toUpperCase();
    if (!["OR", "AND"].includes(modeUpper))
      throw new Error("hasPermission: mode debe ser 'OR' o 'AND'");

    if (modeUpper === "OR") {
      return parsedPerms.some((reqPerm) =>
        permissions.some((perm) => {
          if (!perm || !perm.module || !perm.action) return false;
          // comparaciones case-insensitive; el módulo puede contener ':' en ambos lados
          return (
            String(perm.module).toLowerCase() === String(reqPerm.module).toLowerCase() &&
            String(perm.action).toLowerCase() === String(reqPerm.action).toLowerCase()
          );
        })
      );
    } else {
      return parsedPerms.every((reqPerm) =>
        permissions.some((perm) => {
          if (!perm || !perm.module || !perm.action) return false;
          return (
            String(perm.module).toLowerCase() === String(reqPerm.module).toLowerCase() &&
            String(perm.action).toLowerCase() === String(reqPerm.action).toLowerCase()
          );
        })
      );
    }
  };

  /**
   * Verifica roles del usuario
   * @param {string|string[]} requiredRoles
   */
  const hasRole = (requiredRoles) => {
    if (!roles.length) return false;

    const parsedRoles = (
      Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    ).map((r) => String(r).trim().toLowerCase())
     .filter(Boolean);

    return roles.some((role) =>
      parsedRoles.includes(String(role.name || "").toLowerCase())
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        hasRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar contexto fácilmente
export const useAuth = () => useContext(AuthContext);
