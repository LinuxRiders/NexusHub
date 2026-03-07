import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

/**
 * ProtectedRoute
 *
 * - Protege rutas según autenticación, roles o permisos.
 * - Se integra con el contexto AuthProvider.
 *
 * Ejemplos:
 * - <ProtectedRoute />                            // Solo requiere login
 * - <ProtectedRoute roles={['admin']} />          // Requiere rol admin
 * - <ProtectedRoute perms={['users:read']} />     // Requiere permiso
 * - <ProtectedRoute perms={['users:read','roles:assign']} mode="AND" />
 */
export default function ProtectedRoute({
  roles = null,
  perms = null,
  mode = "OR",
  to = "/",
}) {
  const { isAuthenticated, hasPermission, hasRole, logout, loading } = useAuth();

  // Si aún está cargando la sesión, mostramos un spinner o placeholder
  if (loading) {
    return <div className="text-center mt-8">Cargando...</div>;
  }

  // Si no está autenticado, lo redirigimos
  if (!isAuthenticated) {
    logout();
    return <Navigate to={to} replace />;
  }

  // Validación de roles (si se especifican)
  if (roles && !hasRole(roles)) {
    return <Navigate to={to} replace />;
  }

  // Validación de permisos (si se especifican)
  if (perms && !hasPermission(perms, mode)) {
    return <Navigate to={to} replace />;
  }

  // Si pasa todas las validaciones, renderiza el contenido de la ruta
  return <Outlet />;
}
