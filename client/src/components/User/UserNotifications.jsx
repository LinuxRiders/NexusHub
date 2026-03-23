import React, { useState, useEffect } from "react";
import "./UserNotifications.css";
import api from "../../api/api";
import { FaBell, FaCheck, FaCheckDouble } from "react-icons/fa";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  if (loading)
    return (
      <div className="notifications-container">
        <p>Cargando notificaciones...</p>
      </div>
    );

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Mis Notificaciones</h1>
        {notifications.some((n) => !n.is_read) && (
          <button className="btn-mark-all" onClick={markAllAsRead}>
            <FaCheckDouble /> Marcar todo como leído
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">
            No tienes notificaciones recientes.
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.is_read ? "read" : "unread"}`}
            >
              <div className="notification-icon">
                <FaBell />
              </div>
              <div className="notification-content">
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <span className="notification-date">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              {!n.is_read && (
                <button
                  className="btn-mark-read"
                  onClick={() => markAsRead(n.id)}
                  title="Marcar como leído"
                >
                  <FaCheck />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
