import {
  User,
} from "../models/user.model.js";
import { hashPassword } from "../../../utils/password.js";
import logger from "../../../utils/logger.js";
import { UserRole } from "../models/rolepermission.model.js";
import MailService from '../../../services/mail.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, '../../Courses/templates');
const mailService = new MailService({ templateDir: TEMPLATE_DIR });
const LOGO_PATH = path.join(__dirname, '../../../../assets/logos.png'); // Ajusta según assets

export const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const created_by = req.user?.sub ?? null;

    const existing = await User.findByEmail(email);

    if (existing) {
      logger.warn(
        `UserController:createUser Email already exists: ${username}`
      );
      return res.status(409).json({ error: "Email already exists" });
    }

    const password_hash = await hashPassword(password);
    const userId = await User.create({ username, email, password_hash, created_by });
    const user = await User.findById(userId);

    logger.info(`UserController: createUser User created: user_id=${userId}`);
    res.status(201).json({ data: user });
  } catch (error) {
    logger.error(`UserController: createUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  const created_by = req.user?.sub ?? null;

  try {
    const users = await User.getAll(); // : await User.getChildren(created_by); cuando haya hijos de un usuario

    // Obtener roles de todos los usuarios
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roles = await UserRole.findRolesByUser(user.user_id);
        return { ...user, roles };
      })
    );

    logger.info(`UserController:getAllUsers Retrieved ${usersWithRoles.length} users`);
    res.json({ data: usersWithRoles });
  } catch (error) {
    logger.error(`UserController:getAllUsers Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      logger.warn(`UserController:getUser Not found user_id=${req.params.id}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Obtener los roles del usuario
    const roles = await UserRole.getRolesByUser(user?.user_id);


    // Respuesta con los datos combinados
    res.json({
      data: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        status: user.status,
        roles,
      },
    });
  } catch (error) {
    logger.error(`UserController:getUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      logger.warn(
        `UserController:updateUser Not found user_id=${req.params.id}`
      );
      return res.status(404).json({ error: "User not found" });
    }

    const updates = {};

    // Si hay una contraseña nueva, actualízala (opcional)
    if (req.body.password) {
      updates.password_hash = await hashPassword(req.body.password);
    }

    // Si hay un nuevo status, actualízalo
    if (req.body.status) {
      updates.status = req.body.status;
    }

    // Agregar validación y actualización para otros campos como username y email
    if (req.body.username) {
      updates.username = req.body.username;
    }
    if (req.body.email) {
      updates.email = req.body.email;
    }

    // Aquí puedes agregar más campos si es necesario (roles, etc.)
    if (Object.keys(updates).length > 0) {
      await User.update({ id: req.params.id, updated_by: req.user?.sub }, updates);
    }

    const updatedUser = await User.findById(req.params.id);

    logger.info(
      `UserController:updateUser User updated user_id=${req.params.id}`
    );
    res.json({ data: updatedUser });
  } catch (error) {
    logger.error(`UserController:updateUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      logger.warn(
        `UserController:deleteUser Not found user_id=${id}`
      );
      return res.status(404).json({ error: "User not found" });
    }

    const deletedRows = await User.softDelete(id);
    if (!deletedRows) return res.status(404).json({ error: "Could not delete" });

    logger.info(`UserController:deleteUser User soft deleted user_id=${id}`);
    res.status(204).json({ message: "User soft deleted successfully" });
  } catch (error) {
    logger.error(`UserController:deleteUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * Obtiene la información del usuario autenticado
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.sub ?? null; // Asumiendo que el middleware de autenticación pone la info del usuario en req.user

    // Obtener información básica del usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Construir la respuestaconst
    const userData = {
      id: user.user_id,
      username: user.username,
      email: user.email,
    };

    logger.info(`UserController:getCurrentUser user_id=${userId}`);
    res.json({ data: userData });
  } catch (error) {
    logger.error(`UserController:getCurrentUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id; // Obtener el ID del usuario desde los parámetros de la URL

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Obtener información básica del usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Obtener roles del usuario
    const roles = await UserRole.getRolesByUser(userId);
    const roleNames = roles.map((role) => role.name);


    // Construir la respuesta
    const userData = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      roles: roleNames,
    };

    logger.info(`UserController:getUserById user_id=${userId}`);
    res.json({ data: userData });
  } catch (error) {
    logger.error(`UserController:getUserById Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


export const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { username, email, status } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Actualizar datos del usuario
    const user = await User.findByIdAndUpdate(userId, { username, email, status }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    logger.error(`UserController:updateUserById Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * Envía un correo a una lista de usuarios (o a todos).
 * Body: { userIds: [1, 2, ...], subject, message }
 */
export const sendUserEmail = async (req, res, next) => {
  const { userIds, subject, message } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Debes seleccionar al menos un usuario." });
  }

  try {
    // 1. Obtener emails y nombres de los usuarios seleccionados
    const users = await User.findByIds(userIds);

    if (users.length === 0) {
      return res.status(404).json({ error: 'No se encontraron usuarios válidos.' });
    }

    // 2. Enviar correos
    const emailPromises = users.map(user => {

      return mailService.sendMail({
        toEmail: user.email,
        subject: subject || 'Notificación de MedLearn',
        templateName: 'admin_announcement.html',
        inlineImages: [
          // Verificación laxa de logo
          { varName: 'logo', path: LOGO_PATH }
        ],
        variables: {
          username: user.username,
          message_body: message ? message.replace(/\n/g, '<br>') : '',
          action_button: '',
          year: new Date().getFullYear()
        },
        interpolatedKeys: ['message_body'] // Permitimos que el mensaje contenga variables como {{username}}
      }).catch(err => {
        logger.error(`sendUserEmail failed for ${user.email}: ${err.message}`);
        return null;
      });
    });

    await Promise.all(emailPromises);

    res.status(200).json({
      message: `Mensaje enviado a ${users.length} usuarios.`
    });

  } catch (error) {
    logger.error(`UserController:sendUserEmail Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};



