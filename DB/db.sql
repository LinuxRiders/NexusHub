DROP DATABASE IF EXISTS db_nexushub;

CREATE DATABASE db_nexushub;

USE db_nexushub;

-- //////////////////////////////////////////// GRUPO USUARIOS Y AUTH ///////////////////////////////////////
-- TABLE: USER
-- DROP TABLE USER;
CREATE TABLE `USER` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0, -- 0 = No verificado, 1 = Verificado
  `status` ENUM ('active', 'inactive') NOT NULL DEFAULT 'active',
  password_changed_at DATETIME NULL, -- Campo para el cambio de contraseñas (invalidar sesiones)
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` INT NULL,
  `deleted_at` DATETIME NULL,
  CONSTRAINT fk_user_created_by FOREIGN KEY (`created_by`) REFERENCES `USER` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT fk_user_updated_by FOREIGN KEY (`updated_by`) REFERENCES `USER` (`user_id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Trigger para UNIQUE email pero solo en deleted_at null
DELIMITER $$

CREATE TRIGGER trg_user_prevent_duplicate_email
BEFORE INSERT ON `USER`
FOR EACH ROW
BEGIN
  DECLARE existing_count INT;

  SELECT COUNT(*) INTO existing_count
  FROM `USER`
  WHERE email = NEW.email
    AND deleted_at IS NULL;

  IF existing_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Ya existe un usuario activo con este correo electrónico.';
  END IF;
END$$

DELIMITER ;

-- DROP TABLE REFRESH_TOKEN;
CREATE TABLE IF NOT EXISTS `REFRESH_TOKEN` (
  `refresh_token_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token_hash` BINARY(32) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL,
  `session_start` DATETIME NOT NULL,
  `refresh_count` INT NOT NULL DEFAULT 0,
  `ip` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `USER` (`user_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE pending_verifications (
  verification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- Ej: 'change_email', 'change_password'
  token_hash BINARY(32) NOT NULL,
  payload JSON NULL,                -- Almacena dinámicamente datos JSON
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
  INDEX idx_action_token (token_hash, action_type, used)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- //////////////////////////////////////////// GRUPO ROLES y PERMISOS ///////////////////////////////////////
CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  deleted_at DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES user (user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES user (user_id) ON DELETE SET NULL,
  UNIQUE KEY uq_role_name_creator (name, created_by)
);

CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  deleted_at DATETIME NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES USER (user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES USER (user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS userdata (
  userdata_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  pais VARCHAR(30) DEFAULT NULL,
  user_id INT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  ,
  created_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  deleted_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES USER (user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES USER (user_id) ON DELETE SET NULL
);

-- ===============================================================
-- =================== LOGICA DE AUDITORIA GLOBAL ================
-- ===============================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL, -- Quien disparó la acción (puede ser NULL si fue el sistema)
  action_type VARCHAR(50) NOT NULL, -- Ej: 'USER_REGISTERED', 'PROPERTY_FAVORITED', 'ALERT_MATCH'
  entity_type VARCHAR(50) NOT NULL, -- Ej: 'user', 'property', 'alert'
  entity_id INT NULL, -- El id del elemento afectado
  metadata JSON NULL, -- (OPCIONAL) Datos extra útiles
  created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
  INDEX idx_action (action_type),
  INDEX idx_created (created_at DESC),
  FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ============ ASIGNACION DE ROLES =============

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

 -- ===============================================================
 -- =================== LOGICA DE INMUEBLES =======================
 -- ===============================================================

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avenue VARCHAR(255) NOT NULL,
  city_country VARCHAR(255) NOT NULL DEFAULT 'Trujillo, Perú',
  property_type ENUM('Departamento', 'Casa', 'Oficina', 'Local Comercial', 'Terreno', 'Almacén') NOT NULL,
  operation_type ENUM('COMPRA', 'ALQUILER') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  rooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  levels INT DEFAULT 1,
  mt2 DECIMAL(10, 2) DEFAULT 0,
  images JSON,
  status ENUM('BORRADOR', 'PUBLICADO') DEFAULT 'BORRADOR',
  created_at DATETIME DEFAULT (UTC_TIMESTAMP()),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,
  FOREIGN KEY (created_by) REFERENCES USER(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES USER(user_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS user_favorites (
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at DATETIME DEFAULT (UTC_TIMESTAMP()),
  PRIMARY KEY (user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS user_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_buy BOOLEAN DEFAULT FALSE,
  is_rent BOOLEAN DEFAULT FALSE,
  rooms VARCHAR(10),
  bathrooms VARCHAR(10),
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  min_mt2 DECIMAL(10, 2),
  max_mt2 DECIMAL(10, 2),
  requires_photos BOOLEAN DEFAULT FALSE,
  location VARCHAR(255),
  property_types JSON,
  send_notifications BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT (UTC_TIMESTAMP()),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS user_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  notification_type VARCHAR(50) DEFAULT 'ALERT_MATCH',
  created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
  FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status ENUM('UNREAD', 'READ', 'REPLIED') DEFAULT 'UNREAD',
  replied_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
  FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
