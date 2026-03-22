// src/components/Admin/AdminUsuarios/AdminUsuarios.jsx
import React, { useState } from "react";
import {
  FaTrashAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaEnvelope,
  FaGoogle,
  FaFilter,
  FaPaperPlane,
  FaBan,
  FaCheck,
  FaCalendarAlt,
} from "react-icons/fa";
import "./AdminUsuarios.css";

const initialUsers = [
  {
    id: 1,
    name: "Sofía",
    lastname: "Nolasco",
    email: "sofia.nolasco@gmail.com",
    phone: "987654321",
    country: "Perú",
    status: "ACTIVO",
    authMethod: "email",
    joinDate: "15 Mar 2026",
    avatar: null,
  },
  {
    id: 2,
    name: "Carlos",
    lastname: "Mendoza",
    email: "carlos.m@hotmail.com",
    phone: "912345678",
    country: "Perú",
    status: "ACTIVO",
    authMethod: "google",
    joinDate: "18 Mar 2026",
    avatar: "https://lh3.googleusercontent.com/a/default-user",
  },
  {
    id: 3,
    name: "Andrea",
    lastname: "Salazar",
    email: "andrea.ventas@nexushub.com",
    phone: "998877665",
    country: "Perú",
    status: "INACTIVO",
    authMethod: "email",
    joinDate: "20 Mar 2026",
    avatar: null,
  },
];

const AdminUsuarios = () => {
  const [users, setUsers] = useState(initialUsers);

  // Estados de Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("TODOS");

  // Configuración de Modales
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetUser: null,
  });

  const [mailData, setMailData] = useState({ subject: "", body: "" });

  // ==========================================
  // ESTADÍSTICAS RÁPIDAS
  // ==========================================
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVO").length;
  const inactiveUsers = users.filter((u) => u.status === "INACTIVO").length;
  const googleUsers = users.filter((u) => u.authMethod === "google").length;

  // ==========================================
  // FILTROS
  // ==========================================
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === "ACTIVOS") matchesFilter = user.status === "ACTIVO";
    if (filterType === "SUSPENDIDOS")
      matchesFilter = user.status === "INACTIVO";
    if (filterType === "GOOGLE") matchesFilter = user.authMethod === "google";
    if (filterType === "EMAIL") matchesFilter = user.authMethod === "email";

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // ACCIONES ADMINISTRATIVAS
  // ==========================================
  const handleOpenMessageModal = (user) => {
    setMailData({ subject: "", body: "" });
    setModalConfig({
      isOpen: true,
      type: "send-message",
      targetUser: user,
      message: `Enviar correo a: ${user.name} ${user.lastname}`,
    });
  };

  const handleSendMail = () => {
    if (!mailData.subject || !mailData.body) return;
    setModalConfig({
      isOpen: true,
      type: "success",
      message: `Mensaje enviado con éxito a ${modalConfig.targetUser.email}`,
      targetUser: null,
    });
  };

  const handleToggleStatusClick = (user) => {
    const actionText = user.status === "ACTIVO" ? "suspender" : "reactivar";
    setModalConfig({
      isOpen: true,
      type: "confirm-toggle-status",
      message: `¿Estás seguro de que deseas ${actionText} la cuenta de ${user.name}?`,
      targetUser: user,
    });
  };

  const confirmToggleStatus = () => {
    const newStatus =
      modalConfig.targetUser.status === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setUsers(
      users.map((u) =>
        u.id === modalConfig.targetUser.id ? { ...u, status: newStatus } : u,
      ),
    );
    setModalConfig({
      isOpen: true,
      type: "success",
      message: `La cuenta ha sido ${newStatus === "ACTIVO" ? "reactivada" : "suspendida"}.`,
      targetUser: null,
    });
  };

  const handleDeleteClick = (user) => {
    setModalConfig({
      isOpen: true,
      type: "confirm-delete",
      message: `¿Eliminar permanentemente la cuenta de ${user.name}? Esta acción no se puede deshacer.`,
      targetUser: user,
    });
  };

  const confirmDelete = () => {
    setUsers(users.filter((u) => u.id !== modalConfig.targetUser.id));
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Usuario eliminado de forma permanente.",
      targetUser: null,
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
                className={`btn-modal btn-accept ${
                  !mailData.subject && modalConfig.type === "send-message"
                    ? "disabled"
                    : ""
                }`}
                disabled={
                  !mailData.subject && modalConfig.type === "send-message"
                }
                onClick={
                  modalConfig.type === "confirm-delete"
                    ? confirmDelete
                    : modalConfig.type === "confirm-toggle-status"
                      ? confirmToggleStatus
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

      {/* --- VISTA PRINCIPAL --- */}
      <div className="au-list-view au-fade-in">
        <div className="au-header">
          <div className="au-title-group">
            <h1 className="au-title">Comunidad y Usuarios</h1>
            <h2 className="au-subtitle">
              Supervisa las cuentas registradas en la plataforma
            </h2>
          </div>
        </div>

        {/* DASHBOARD RÁPIDO */}
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
            <span className="au-stat-label">Suspendidos</span>
            <span className="au-stat-value au-text-red">{inactiveUsers}</span>
          </div>
          <div className="au-stat-item">
            <span className="au-stat-label">Logins Google</span>
            <span className="au-stat-value au-flex-align">
              <FaGoogle className="au-icon-google" /> {googleUsers}
            </span>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS */}
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="au-filter-select"
            >
              <option value="TODOS">Todos los usuarios</option>
              <optgroup label="Por Estado">
                <option value="ACTIVOS">Solo Activos</option>
                <option value="SUSPENDIDOS">Solo Suspendidos</option>
              </optgroup>
              <optgroup label="Por Registro">
                <option value="GOOGLE">Login Google</option>
                <option value="EMAIL">Login Email</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="au-table-container">
          <table className="au-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th className="au-hide-mobile">Contacto</th>
                <th>Acceso / Fecha</th>
                <th>Estado</th>
                <th className="au-th-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={
                      user.status === "INACTIVO" ? "au-row-inactive" : ""
                    }
                  >
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
                        <span className="au-text-muted">
                          {user.country || "No especificado"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="au-access-info">
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
                        <div className="au-join-date">
                          <FaCalendarAlt /> {user.joinDate}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`au-badge-status au-status-${user.status.toLowerCase()}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* CORRECCIÓN: El <td> se mantiene estándar, los botones van en un <div> flex */}
                    <td className="au-th-center">
                      <div className="au-col-actions">
                        <button
                          className="au-btn-icon au-sendmail"
                          onClick={() => handleOpenMessageModal(user)}
                          title="Enviar Mensaje"
                        >
                          <FaEnvelope />
                        </button>
                        <button
                          className={`au-btn-icon ${user.status === "ACTIVO" ? "au-ban" : "au-unban"}`}
                          onClick={() => handleToggleStatusClick(user)}
                          title={
                            user.status === "ACTIVO"
                              ? "Suspender Usuario"
                              : "Reactivar Usuario"
                          }
                        >
                          {user.status === "ACTIVO" ? <FaBan /> : <FaCheck />}
                        </button>
                        <button
                          className="au-btn-icon au-delete"
                          onClick={() => handleDeleteClick(user)}
                          title="Eliminar Permanentemente"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
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
    </div>
  );
};

export default AdminUsuarios;
