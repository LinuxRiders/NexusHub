// src/components/Admin/AdminUsuarios/AdminUsuarios.jsx
import React, { useState } from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaUserTie,
  FaSearch,
  FaEnvelope,
  FaGoogle,
  FaFilter,
  FaPaperPlane,
} from "react-icons/fa";
import "./AdminUsuarios.css";

// Mock de datos avanzado
const initialUsers = [
  {
    id: 1,
    name: "Sofía",
    lastname: "Nolasco",
    email: "sofia.nolasco@gmail.com",
    phone: "987654321",
    country: "Perú",
    role: "ADMIN",
    status: "ACTIVO",
    authMethod: "email",
    avatar: null,
  },
  {
    id: 2,
    name: "Carlos",
    lastname: "Mendoza",
    email: "carlos.m@hotmail.com",
    phone: "912345678",
    country: "Perú",
    role: "CLIENTE",
    status: "ACTIVO",
    authMethod: "google",
    avatar: "https://lh3.googleusercontent.com/a/default-user",
  },
  {
    id: 3,
    name: "Andrea",
    lastname: "Salazar",
    email: "andrea.ventas@nexushub.com",
    phone: "998877665",
    country: "Perú",
    role: "AGENTE",
    status: "INACTIVO",
    authMethod: "email",
    avatar: null,
  },
];

const AdminUsuarios = () => {
  const [users, setUsers] = useState(initialUsers);
  const [view, setView] = useState("list");
  const [currentId, setCurrentId] = useState(null);

  // Estados de Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    country: "Perú",
    role: "CLIENTE",
    status: "ACTIVO",
    authMethod: "email",
  });

  const [formErrors, setFormErrors] = useState({});

  // Configuración de Modales
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetId: null,
    targetEmail: "",
  });

  const [mailData, setMailData] = useState({ subject: "", body: "" });

  // ==========================================
  // ESTADÍSTICAS RÁPIDAS
  // ==========================================
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVO").length;
  const totalAgents = users.filter((u) => u.role === "AGENTE").length;
  const googleUsers = users.filter((u) => u.authMethod === "google").length;

  // ==========================================
  // MANEJADORES DE VISTA Y FORMULARIO
  // ==========================================
  const handleAddNew = () => {
    setFormData({
      name: "",
      lastname: "",
      email: "",
      phone: "",
      country: "Perú",
      role: "CLIENTE",
      status: "ACTIVO",
      authMethod: "email",
    });
    setFormErrors({});
    setCurrentId(null);
    setView("form");
  };

  const handleEdit = (user) => {
    setFormData({ ...user });
    setFormErrors({});
    setCurrentId(user.id);
    setView("form");
  };

  const handleCancelForm = () => {
    setView("list");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrado compuesto (Búsqueda + Rol)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "TODOS" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) errors.name = "Requerido.";
    if (!formData.lastname.trim()) errors.lastname = "Requerido.";
    if (!formData.email.trim()) {
      errors.email = "Requerido.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Correo inválido.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==========================================
  // ACCIONES DE MODALES
  // ==========================================
  const handleDeleteClick = (id) => {
    setModalConfig({
      isOpen: true,
      type: "confirm-delete",
      message: "Esta acción eliminará la cuenta permanentemente.",
      targetId: id,
    });
  };

  const confirmDelete = () => {
    setUsers(users.filter((u) => u.id !== modalConfig.targetId));
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Usuario eliminado correctamente.",
    });
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setModalConfig({
      isOpen: true,
      type: "confirm-save",
      message: currentId
        ? "¿Actualizar los datos del usuario?"
        : "¿Crear nueva cuenta?",
    });
  };

  const confirmSave = () => {
    if (currentId) {
      setUsers(
        users.map((u) =>
          u.id === currentId ? { ...formData, id: currentId } : u,
        ),
      );
    } else {
      const newId =
        users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      setUsers([...users, { ...formData, id: newId }]);
    }
    setView("list");
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Guardado exitosamente.",
    });
  };

  const handleOpenMessageModal = (user) => {
    setMailData({ subject: "", body: "" });
    setModalConfig({
      isOpen: true,
      type: "send-message",
      targetEmail: user.email,
      message: `Enviar correo a: ${user.name}`,
    });
  };

  const handleSendMail = () => {
    if (!mailData.subject || !mailData.body) return;
    setModalConfig({
      isOpen: true,
      type: "success",
      message: `Mensaje enviado con éxito a ${modalConfig.targetEmail}`,
    });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <div className="au-container">
      {/* MODAL GLOBAL MULTIUSO */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type.includes("confirm") ? (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              ) : modalConfig.type === "send-message" ? (
                <FaEnvelope className="modal-icon confirm-icon" />
              ) : (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
            </div>
            <h3 className="modal-title">
              {modalConfig.type === "send-message"
                ? "Redactar Mensaje"
                : modalConfig.type.includes("confirm")
                  ? "Confirmar Acción"
                  : "¡Éxito!"}
            </h3>
            <p className="modal-message">{modalConfig.message}</p>

            {modalConfig.type === "send-message" && (
              <div className="au-modal-mail-form">
                <input
                  type="text"
                  placeholder="Asunto del mensaje"
                  value={mailData.subject}
                  onChange={(e) =>
                    setMailData({ ...mailData, subject: e.target.value })
                  }
                  className="au-mail-input"
                />
                <textarea
                  placeholder="Escribe tu mensaje aquí..."
                  rows="4"
                  value={mailData.body}
                  onChange={(e) =>
                    setMailData({ ...mailData, body: e.target.value })
                  }
                  className="au-mail-textarea"
                ></textarea>
              </div>
            )}

            <div className="modal-actions">
              {(modalConfig.type.includes("confirm") ||
                modalConfig.type === "send-message") && (
                <button className="btn-modal btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
              )}
              <button
                className={`btn-modal btn-accept ${!mailData.subject && modalConfig.type === "send-message" ? "disabled" : ""}`}
                disabled={
                  !mailData.subject && modalConfig.type === "send-message"
                }
                onClick={
                  modalConfig.type === "confirm-delete"
                    ? confirmDelete
                    : modalConfig.type === "confirm-save"
                      ? confirmSave
                      : modalConfig.type === "send-message"
                        ? handleSendMail
                        : closeModal
                }
              >
                {modalConfig.type === "send-message" ? (
                  <>
                    <FaPaperPlane style={{ marginRight: "8px" }} /> Enviar
                  </>
                ) : (
                  "Aceptar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA DE LISTA (TABLA) --- */}
      {view === "list" && (
        <div className="au-list-view au-fade-in">
          <div className="au-header">
            <div className="au-title-group">
              <h1 className="au-title">Gestión de Usuarios</h1>
              <h2 className="au-subtitle">
                Directorio completo de clientes y personal
              </h2>
            </div>
            <button className="au-btn-primary" onClick={handleAddNew}>
              <FaPlus /> Nuevo Usuario
            </button>
          </div>

          <div className="au-stats-bar">
            <div className="au-stat-item">
              <span className="au-stat-label">Total Usuarios</span>
              <span className="au-stat-value">{totalUsers}</span>
            </div>
            <div className="au-stat-item">
              <span className="au-stat-label">Cuentas Activas</span>
              <span className="au-stat-value au-text-green">{activeUsers}</span>
            </div>
            <div className="au-stat-item">
              <span className="au-stat-label">Agentes Inmob.</span>
              <span className="au-stat-value au-text-corp">{totalAgents}</span>
            </div>
            <div className="au-stat-item">
              <span className="au-stat-label">Logins Google</span>
              <span className="au-stat-value au-flex-align">
                <FaGoogle className="au-icon-google" /> {googleUsers}
              </span>
            </div>
          </div>

          <div className="au-toolbar">
            <div className="au-search-bar">
              <FaSearch className="au-search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="au-filter-bar">
              <FaFilter className="au-search-icon" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="au-filter-select"
              >
                <option value="TODOS">Todos los roles</option>
                <option value="CLIENTE">Clientes</option>
                <option value="AGENTE">Agentes</option>
                <option value="ADMIN">Administradores</option>
              </select>
            </div>
          </div>

          <div className="au-table-container">
            <table className="au-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th className="au-hide-mobile">Contacto</th>
                  <th>Registro</th>
                  <th>Rol / Estado</th>
                  <th className="au-th-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="au-td-flex">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt="avatar"
                              className="au-avatar-img"
                            />
                          ) : (
                            <div className="au-avatar-placeholder">
                              {user.name.charAt(0)}
                              {user.lastname.charAt(0)}
                            </div>
                          )}
                          <div>
                            <strong>
                              {user.name} {user.lastname}
                            </strong>
                            <span className="au-text-muted">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="au-hide-mobile">
                        <div>
                          <strong>{user.phone || "Sin teléfono"}</strong>
                          <span className="au-text-muted">{user.country}</span>
                        </div>
                      </td>

                      <td>
                        <div
                          className={`au-auth-badge ${user.authMethod === "google" ? "au-auth-google" : "au-auth-email"}`}
                        >
                          {user.authMethod === "google" ? (
                            <FaGoogle />
                          ) : (
                            <FaEnvelope />
                          )}
                          <span>
                            {user.authMethod === "google" ? "Google" : "Email"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="au-badges-column">
                          <span
                            className={`au-badge-role au-role-${user.role.toLowerCase()}`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`au-badge-status au-status-${user.status.toLowerCase()}`}
                          >
                            {user.status}
                          </span>
                        </div>
                      </td>

                      <td className="au-col-actions">
                        <button
                          className="au-btn-icon au-sendmail"
                          onClick={() => handleOpenMessageModal(user)}
                          title="Enviar Mensaje"
                        >
                          <FaEnvelope />
                        </button>
                        <button
                          className="au-btn-icon au-edit"
                          onClick={() => handleEdit(user)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="au-btn-icon au-delete"
                          onClick={() => handleDeleteClick(user.id)}
                          title="Eliminar"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="au-no-data">
                      No se encontraron resultados para la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- VISTA DE FORMULARIO (CREAR/EDITAR) --- */}
      {view === "form" && (
        <div className="au-form-view au-fade-in">
          <div className="au-header au-form-header">
            <button className="au-btn-back" onClick={handleCancelForm}>
              <FaArrowLeft /> Volver a la lista
            </button>
            <div className="au-title-group au-mt-2">
              <h1 className="au-title">
                {currentId
                  ? "Editar Perfil de Usuario"
                  : "Registrar Nuevo Usuario"}
              </h1>
              <h2 className="au-subtitle">
                Configura los datos personales y los permisos de la cuenta
              </h2>
            </div>
          </div>

          <form className="au-form-container" onSubmit={handleSaveClick}>
            {formData.authMethod === "google" && (
              <div className="au-form-alert">
                <FaGoogle className="au-icon-google" />
                <span>
                  Este usuario inició sesión mediante Google. La contraseña y el
                  correo principal son gestionados por su cuenta de Google.
                </span>
              </div>
            )}

            <div className="au-form-section">
              <h3 className="au-section-title">
                <FaUserTie /> Datos Personales
              </h3>
              <div className="au-form-grid">
                <div
                  className={`au-input-box ${formErrors.name ? "au-has-error" : ""}`}
                >
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {formErrors.name && (
                    <span className="au-error-text">{formErrors.name}</span>
                  )}
                </div>
                <div
                  className={`au-input-box ${formErrors.lastname ? "au-has-error" : ""}`}
                >
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                  />
                  {formErrors.lastname && (
                    <span className="au-error-text">{formErrors.lastname}</span>
                  )}
                </div>
                <div
                  className={`au-input-box ${formErrors.email ? "au-has-error" : ""}`}
                >
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={formData.authMethod === "google"}
                    className={
                      formData.authMethod === "google"
                        ? "au-readonly-input"
                        : ""
                    }
                  />
                  {formErrors.email && (
                    <span className="au-error-text">{formErrors.email}</span>
                  )}
                </div>
                <div className="au-input-box">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="au-form-section">
              <h3 className="au-section-title">
                <FaCheckCircle /> Permisos de Acceso
              </h3>
              <div className="au-form-grid">
                <div className="au-input-box">
                  <label>Rol del Usuario *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="au-select"
                  >
                    <option value="CLIENTE">Cliente Estándar</option>
                    <option value="AGENTE">Agente Inmobiliario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="au-input-box">
                  <label>Estado de la Cuenta *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="au-select"
                  >
                    <option value="ACTIVO">ACTIVO (Acceso permitido)</option>
                    <option value="INACTIVO">
                      INACTIVO (Bloqueado/Suspendido)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="au-form-actions">
              <button
                type="button"
                className="au-btn-secondary"
                onClick={handleCancelForm}
              >
                Cancelar
              </button>
              <button type="submit" className="au-btn-primary">
                <FaSave /> Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
