import React, { useState, useEffect } from "react";
import "./UserNotifications.css";
import api from "../../api/api";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Por defecto 5 notificaciones por página

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Efecto de seguridad: Si marcamos/eliminamos y la página actual queda vacía, retrocedemos
  useEffect(() => {
    const maxPage = Math.ceil(notifications.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [notifications.length, itemsPerPage, currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications/me");
      setNotifications(res.data.data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  // --- LÓGICA DE PAGINACIÓN MATEMÁTICA ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = notifications.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Volver a la primera página al cambiar cantidad
  };

  if (loading)
    return (
      <div className="notifications-container loading-state">
        <div className="spinner"></div>
        <p>Cargando notificaciones...</p>
      </div>
    );

  return (
    <div className="notifications-container">
      {/* HEADER */}
      <div className="notifications-header">
        <div className="notifications-title-area">
          <div className="title-icon-wrapper">
            <FaBell />
          </div>
          <h1>Mis Notificaciones</h1>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button className="btn-mark-all" onClick={markAllAsRead}>
            <FaCheckDouble /> Marcar todo como leído
          </button>
        )}
      </div>

      <div className="notifications-content">
        {notifications.length === 0 ? (
          <p className="no-notifications">
            No tienes notificaciones recientes.
          </p>
        ) : (
          <>
            {/* --- CONTROLES DE FILTRO / PAGINACIÓN SUPERIOR --- */}
            <div className="notifications-controls">
              <span className="notifications-count-info">
                Mostrando {indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, notifications.length)} de{" "}
                {notifications.length} notificaciones
              </span>
              <div className="notifications-filter-group">
                <label>Mostrar:</label>
                <select
                  className="items-per-page-select"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={5}>5 notificaciones</option>
                  <option value={10}>10 notificaciones</option>
                  <option value={20}>20 notificaciones</option>
                </select>
              </div>
            </div>

            {/* --- LISTA DE NOTIFICACIONES --- */}
            <div className="notifications-list">
              {currentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-card ${n.is_read ? "read" : "unread"}`}
                >
                  <div className="notification-icon">
                    <FaBell />
                  </div>
                  <div className="notification-details">
                    <h3>{n.title}</h3>
                    <p>{n.message}</p>
                    {n.action_url && (
                      <a 
                        href={n.action_url} 
                        className="btn-action-view" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: '8px', padding: '6px 14px', backgroundColor: '#1c6a6e', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}
                      >
                        Ver Propiedad
                      </a>
                    )}
                    <span className="notification-date">
                      {new Date(n.created_at).toLocaleString([], {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!n.is_read ? (
                      <button
                        className="btn-mark-read"
                        onClick={() => markAsRead(n.id)}
                        title="Marcar como leído"
                      >
                        <FaCheck />
                      </button>
                    ) : (
                      <span className="read-indicator" title="Leída">
                        <FaCheckDouble />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* --- NAVEGACIÓN DE PÁGINAS INFERIOR --- */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
