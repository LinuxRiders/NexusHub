import React from "react";
import { useAuth } from "../context/AuthProvider";

/**
 * withPermission HOC
 *
 * Envuelve un componente y valida permisos antes de renderizarlo.
 * - Usa hasPermission del AuthContext (soporta 'OR' / 'AND').
 * - Muestra mensaje de acceso denegado cuando corresponde.
 * - Mantiene las props originales y forward refs si se necesita (simple).
 *
 * @param {React.ComponentType} WrappedComponent - Componente a proteger.
 * @param {string|string[]} requiredPermissions - Permiso o lista de permisos en formato 'module:action'.
 * @param {'OR'|'AND'} mode - Modo de evaluación: 'OR' (default) o 'AND'.
 *
 * Uso:
 * ```jsx
 * // Protege componente para que el usuario tenga al menos users:read
 * export default withPermission(MyComponent, 'users:read');
 *
 * // Protege requiriendo ambos permisos
 * export default withPermission(MyComponent, ['users:read','roles:assign'], 'AND');
 * ```
 */
const withPermission = (WrappedComponent, requiredPermissions, mode = "OR") => {
  const HOC = (props) => {
    const { loading, isAuthenticated, hasPermission } = useAuth();

    // Mientras carga el estado de auth: no renderizamos nada (o puedes poner un skeleton)
    if (loading) {
      return <div>Cargando permisos...</div>;
    }

    // Si no está autenticado, negamos acceso (frontend guard básico)
    if (!isAuthenticated) {
      return <div>No autenticado. Acceso denegado.</div>;
    }

    // Delegamos la lógica real al hasPermission del contexto (maneja formatos y validaciones)
    let allowed = false;
    try {
      allowed = hasPermission(requiredPermissions, mode);
    } catch (e) {
      console.error("withPermission: error evaluando permisos", e);
      allowed = false;
    }

    if (!allowed) {
      return <div>No tienes acceso a esta sección</div>;
    }

    return <WrappedComponent {...props} />;
  };

  // Nombre para debugging y DevTools
  const wrappedName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  HOC.displayName = `withPermission(${wrappedName})`;

  return HOC;
};

export default withPermission;

/**
 * HasPermission componente
 *
 * Renderiza children sólo si el usuario tiene los permisos requeridos.
 * - Permite recibir permission como string o array.
 * - Permite especificar modo: 'OR' (default) o 'AND'.
 * - No renderiza nada si no cumple (comportamiento tipo guard).
 *
 * Props:
 *  - permission: string | string[]  (ej: 'users:read' o ['users:read','roles:assign'])
 *  - mode: 'OR' | 'AND' (opcional)
 *
 * Uso:
 * ```jsx
 * <HasPermission permission="users:read">
 *   <button>Ver usuarios</button>
 * </HasPermission>
 *
 * <HasPermission permission={['users:read','roles:assign']} mode="AND">
 *   <button>Asignar roles</button>
 * </HasPermission>
 * ```
 */
export const HasPermission = ({ permission, mode = "OR", children }) => {
  const { loading, isAuthenticated, hasPermission } = useAuth();

  // Mientras carga, no mostramos nada (evita parpadeo). Si prefieres un loader, cámbialo.
  if (loading) return null;

  if (!isAuthenticated) return null;

  let allowed = false;
  try {
    allowed = hasPermission(permission, mode);
  } catch (e) {
    console.error("HasPermission: error evaluando permisos", e);
    allowed = false;
  }

  return allowed ? <>{children}</> : null;
};
