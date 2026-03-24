// src/components/Admin/AdminUsuarios/AdminUsuarios.jsx
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaEnvelope,
  FaGoogle,
  FaFilter,
  FaPaperPlane,
  FaBan,
  FaCheck,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronLeft, // Añadido para paginación
  FaChevronRight, // Añadido para paginación
} from "react-icons/fa";
import api from "../../api/api";
import "./AdminUsuarios.css";

const AdminUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    googleUsers: 0,
  });

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Por defecto 10 usuarios por página

  useEffect(() => {
    const fetchUsersAndStats = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get("/users/"),
          api.get("/users/stats?includeAdmins=false"),
        ]);

        // Filtrar cualquier rol administrativo de la vista (si si tiene roles = mostrar)
        const filteredData = (usersRes.data.data || []).filter(
          (u) => !u.roles || u.roles.length > 0,
        );

        // Mapear los datos de la DB al formato esperado por el frontend
        const mappedUsers = filteredData.map((u) => ({
          id: u.user_id,
          name: u.nombres || u.username,
          lastname: u.apellidos || "",
          email: u.email,
          phone: u.telefono || "",
          country: u.pais || "",
          status: (u.status || "active").toUpperCase(),
          authMethod: "email", // Dejamos por defecto 'email' hasta dar soporte a Google
          joinDate: new Date(u.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          avatar: null,
        }));

        setUsers(mappedUsers);
        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching users or stats:", error);
      }
    };
    fetchUsersAndStats();
  }, []);

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
  const { totalUsers, activeUsers, inactiveUsers, googleUsers } = stats;

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reiniciar a la página 1 al buscar
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reiniciar a la página 1 al cambiar de filtro
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === "ACTIVOS")
      matchesFilter = user.status === "ACTIVO" || user.status === "ACTIVE";
    if (filterType === "SUSPENDIDOS")
      matchesFilter = user.status === "INACTIVO" || user.status === "INACTIVE";
    if (filterType === "GOOGLE") matchesFilter = user.authMethod === "google";
    if (filterType === "EMAIL") matchesFilter = user.authMethod === "email";

    return matchesSearch && matchesFilter;
  });

  // Efecto de seguridad para la paginación
  useEffect(() => {
    const maxPage = Math.ceil(filteredUsers.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [filteredUsers.length, itemsPerPage, currentPage]);

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

  const handleSendMail = async () => {
    if (!mailData.subject || !mailData.body) return;
    try {
      await api.post("/users/message", {
        userIds: [modalConfig.targetUser.id],
        subject: mailData.subject,
        message: mailData.body,
      });
      setModalConfig({
        isOpen: true,
        type: "success",
        message: `Mensaje enviado con éxito a ${modalConfig.targetUser.email}`,
        targetUser: null,
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Ocurrió un error al enviar el correo.",
        targetUser: null,
      });
    }
  };

  const handleToggleStatusClick = (user) => {
    const isActive = user.status === "ACTIVO" || user.status === "ACTIVE";
    const actionText = isActive ? "desactivar" : "reactivar";
    setModalConfig({
      isOpen: true,
      type: "confirm-toggle-status",
      message: `¿Estás seguro de que deseas ${actionText} permanentemente el acceso de la cuenta de ${user.name}?`,
      targetUser: user,
    });
  };

  const confirmToggleStatus = async () => {
    const isActive =
      modalConfig.targetUser.status === "ACTIVO" ||
      modalConfig.targetUser.status === "ACTIVE";
    const newStatus = isActive ? "inactive" : "active";

    try {
      // 1. Llamar al API para cambiar el estado
      await api.patch(`/users/${modalConfig.targetUser.id}`, {
        status: newStatus,
      });

      // 2. Actualizar el estado local
      setUsers(
        users.map((u) =>
          u.id === modalConfig.targetUser.id
            ? { ...u, status: newStatus.toUpperCase() }
            : u,
        ),
      );

      // 3. Confirmar al administrador
      setModalConfig({
        isOpen: true,
        type: "success",
        message: `La cuenta ha sido ${newStatus === "active" ? "reactivada" : "suspendida"}.`,
        targetUser: null,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Ocurrió un error al actualizar el estado del usuario.",
        targetUser: null,
      });
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // ==========================================
  // LÓGICA DE PAGINACIÓN MATEMÁTICA
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Volver a la primera página al cambiar cantidad
  };

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
                    ? confirmDelete // Nota: Esta función parece no estar definida en este componente, asumo que era para futura implementación.
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
              onChange={handleFilterChange}
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

        {/* CONTROLES DE PAGINACIÓN */}
        {filteredUsers.length > 0 && (
          <div className="au-pagination-controls">
            <span className="au-count-info">
              Mostrando {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredUsers.length)} de{" "}
              {filteredUsers.length} usuarios
            </span>
            <div className="au-filter-group">
              <label>Mostrar:</label>
              <select
                className="items-per-page-select"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={10}>10 usuarios</option>
                <option value={20}>20 usuarios</option>
                <option value={50}>50 usuarios</option>
              </select>
            </div>
          </div>
        )}

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
                currentUsers.map((user) => (
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
                        <br />
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
                          className={`au-btn-icon ${
                            user.status === "ACTIVO" || user.status === "ACTIVE"
                              ? "au-ban"
                              : "au-unban"
                          }`}
                          onClick={() => handleToggleStatusClick(user)}
                          title={
                            user.status === "ACTIVO" || user.status === "ACTIVE"
                              ? "Desactivar Usuario"
                              : "Reactivar Usuario"
                          }
                          style={{
                            width: "auto",
                            padding: "0 10px",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          {user.status === "ACTIVO" ||
                          user.status === "ACTIVE" ? (
                            <>
                              <FaBan />
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 600,
                                }}
                              >
                                Desactivar
                              </span>
                            </>
                          ) : (
                            <>
                              <FaCheck />
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 600,
                                }}
                              >
                                Activar
                              </span>
                            </>
                          )}
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

        {/* NAVEGACIÓN DE PÁGINAS INFERIOR */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FaChevronLeft />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsuarios;
