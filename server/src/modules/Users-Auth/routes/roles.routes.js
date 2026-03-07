import { Router } from 'express';
import { asignPermissionsToRole, asignRolToUser, createChildUser, createRol, deleteChildUser, deleteRol, editChildUser, editRol, getChilduseById, getChildusers, getMyPermissions, getMyRolesWithPermissions, getPermissionsByRole, getRoles, getUsers } from '../controllers/roles.controller.js';
import { validateResults } from '../../../middlewares/validationResult.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { idParamValidation } from '../../../validations/validations.js';
import { asignPermissionsToRoleValidation, asignRolToUserValidation, createChildUserValidation, createRolValidation, getChilduseByIdValidation, getChildusersValidation, getMyPermissionsValidation, getMyRolesWithPermissionsValidation, getPermissionsByRoleValidation, getRolesValidation, getUsersValidation } from '../validations/roles.validation.js';
import { requirePermission } from '../../../middlewares/permissions.middleware.js';
import { verifyOwnership } from '../../../middlewares/ownership.middleware.js';

import { Role } from '../models/rolepermission.model.js';
import { User } from '../models/user.model.js';

const router = Router();
router.use(authMiddleware); // Apply authentication 

// Logica de Negocio con Permisos COMPLETA:

// Un USUARIO Puede Crear, Editar y Borrar Roles
router.post('/', requirePermission('roles:create'), createRolValidation, validateResults, createRol); // CREAR ROL
router.put('/:id', requirePermission('roles:edit'), idParamValidation, validateResults, verifyOwnership({ getEntity: (req) => Role.findByIdForUpdate(req.params.id) }), editRol); // EDITAR ROL O DESCENDIENTE
router.delete('/:id', requirePermission('roles:delete'), idParamValidation, validateResults, verifyOwnership({ getEntity: (req) => Role.findByIdForUpdate(req.params.id), checkDescendants: false }), deleteRol); // BORRAR ROL

// UN USUARIO Puede Asignar/quitar Permisos a Roles solo de los que posee 
// UN USUARIO Puede quitar permisos a sus Roles y de forma recursiva les quita esos permisos a los Roles de sus subusuarios
router.put('/:id/permissions', requirePermission('permissions:edit'), idParamValidation, asignPermissionsToRoleValidation, validateResults, verifyOwnership({ getEntity: (req) => Role.findById(req.params.id) }), asignPermissionsToRole);

// UN USUARIO Puede Listar todos los Permisos que posee (de sus Roles) 
router.get('/permissions/me', getMyPermissionsValidation, validateResults, getMyPermissions);
// UN USUARIO Puede Listar los Permisos de los Roles que ha creado
router.get('/permissions', requirePermission('permissions:see'), getMyRolesWithPermissionsValidation, validateResults, getMyRolesWithPermissions);
// UN USUARIO Puede Listar los Permisos de un Rol que ha creado
router.get('/:id/permissions', requirePermission('permissions:see'), idParamValidation, getPermissionsByRoleValidation, validateResults, verifyOwnership({ getEntity: (req) => User.findByIdForUpdate(req.params.id) }), getPermissionsByRole);


// TODO: Asignar role admin al crear un childUser
// Un USUARIO Puede Crear, Editar y Borrar Usuarios
router.post('/childuser', requirePermission('users:create'), createChildUserValidation, validateResults, createChildUser); // CREAR USUARIO
router.put('/childuser/:id', requirePermission('users:edit'), idParamValidation, validateResults, verifyOwnership({ getEntity: (req) => User.findByIdForUpdate(req.params.id), descendantCompareField: "user_id" }), editChildUser); // EDITAR USUARIO O DESCENDIENTE
router.delete('/childuser/:id', requirePermission('users:delete'), idParamValidation, validateResults, verifyOwnership({ getEntity: (req) => User.findByIdForUpdate(req.params.id), descendantCompareField: "user_id" }), deleteChildUser); // BORRAR USUARIO O DESCENDIENTE

// UN USUARIO Puede Asignar/quitar roles a sus subusuarios solo de los que posee
router.put('/to/childuser/:id', requirePermission('roles:assign'), idParamValidation, asignRolToUserValidation, validateResults, verifyOwnership({ getEntity: (req) => User.findByIdForUpdate(req.params.id), checkDescendants: false }), asignRolToUser);
// router.put('/childuser/:id', requirePermission(['roles:create', 'users:create'], "AND"), idParamValidation, asignRolToUserValidation, validateResults, asignRolToUser);

// UN USUARIO Puede Listar los subusuarios que ha creado con sus roles actuales
router.get('/childuser', requirePermission('users:create'), getChildusersValidation, validateResults, getChildusers);
// UN USUARIO Puede Listar un subusuario que ha creado o es descendiente con sus roles actuales
router.get('/childuser/:id', requirePermission('users:create'), idParamValidation, getChilduseByIdValidation, validateResults, verifyOwnership({ getEntity: (req) => User.findById(req.params.id), descendantCompareField: "user_id" }), getChilduseById);


// UN USUARIO Puede ver los usuarios y roles que ha creado
router.get('/', requirePermission('roles:create'), getRolesValidation, validateResults, getRoles);
router.get('/users', requirePermission('users:create'), getUsersValidation, validateResults, getUsers);


export default router;
