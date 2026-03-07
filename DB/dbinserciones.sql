USE db_nexora;
-- =======================================================================
-- ========================= INSERCIONES BASE ============================
-- =======================================================================

-- =============== PERMISOS DEL SISTEMA =====================

INSERT INTO permissions (module, action, description, created_by)
VALUES
  -- ===== MÓDULO: USERS =====
  (
    'users',
    'create',
    'Permite crear nuevos usuarios',
    NULL
  ),
  (
    'users',
    'edit',
    'Permite editar la información de un usuario existente',
    NULL
  ),
  (
    'users',
    'delete',
    'Permite eliminar usuarios',
    NULL
  ),
  -- ===== MÓDULO: roles =====
  (
    'roles',
    'create',
    'Permite crear nuevos roles',
    NULL
  ),
  (
    'roles',
    'edit',
    'Permite editar la información de un rol existente',
    NULL
  ),
  ('roles', 'delete', 'Permite eliminar roles', NULL),
  ('roles', 'assign', 'Permite asignar roles a childusers', NULL),
  -- ===== MÓDULO: permissions =====
  (
    'permissions',
    'see',
    'Permite visualizar los permisos',
    NULL
  ),
  (
    'permissions',
    'edit',
    'Permite quitar permisos o asignarlos a roles',
    NULL
  );


-- ============ ASIGNACION DE ROLES Y PERMISOS =============

-- Crear rol "SuperAdministrador"
INSERT INTO
  roles (name, description, created_by)
VALUES
  ('dev', 'Acceso total al sistema', NULL);

-- Crear roles del sistema "USER"
INSERT INTO
  roles (name, description, created_by)
VALUES
  ('user', 'Usuario comun del sistema', NULL);

-- Asignar todos los permisos existentes al rol "SuperAdministrador"
INSERT IGNORE 
	INTO role_permissions (role_id, permission_id, created_by)
SELECT
	( SELECT role_id FROM roles
	WHERE name = 'dev' AND deleted_at IS NULL LIMIT 1 ) 
	AS role_id, p.permission_id, NULL AS created_by
FROM
  permissions p
WHERE
  p.deleted_at IS NULL;


-- =================== CREACION DE USUARIOS =======================

INSERT 
	INTO USER (username, email, password_hash, is_verified)
VALUES
	( 'Admin','med@admin.com', '$2b$10$SN94lmApxyHlvWebzloLP.0JoG11yw7vSt4gxmy1I87hTp9BLmVD.', 1 ); -- psswd: F@cil123
  
-- Asignar el rol dev al usuario ID 1
INSERT 
	INTO user_roles (user_id, role_id, created_by)
VALUES
	(1, 1, NULL);
