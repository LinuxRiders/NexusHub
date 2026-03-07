DROP DATABASE IF EXISTS db_nexora;

CREATE DATABASE db_nexora;

USE db_nexora;

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

CREATE TABLE account_verifications (
  verification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash BINARY(32) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT (1) DEFAULT 0,
  -- Auditoria
  ip VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
  INDEX idx_verif_lookup (user_id, token_hash, used) -- Índice compuesto para búsquedas rápidas
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;


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

CREATE TABLE password_reset (
  password_reset_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash BINARY(32) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  -- Auditoria
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
  INDEX (token_hash),
  INDEX (user_id)
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

CREATE TABLE permissions (
  permission_id INT AUTO_INCREMENT PRIMARY KEY,
  module VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  UNIQUE KEY unique_perm (module, action),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  deleted_at DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES USER (user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES USER (user_id) ON DELETE SET NULL
);

-- DROP TABLE role_permissions;

CREATE TABLE role_permissions (
  role_id INT,
  permission_id INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  deleted_at DATETIME NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions (permission_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES USER (user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES USER (user_id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS userdata (
  userdata_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  ciudad VARCHAR(30) DEFAULT NULL,
  centro_estudios VARCHAR(100) DEFAULT NULL,
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



