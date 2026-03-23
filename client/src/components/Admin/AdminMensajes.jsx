// src/components/Admin/AdminMensajes/AdminMensajes.jsx
import React, { useState } from "react";
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
  FaTrashAlt,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaPhoneAlt,
  FaUser,
  FaCheck,
} from "react-icons/fa";
import api from "../../api/api";
import "./AdminMensajes.css";

const AdminMensajes = () => {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  // Estado para el visor de mensajes
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetId: null,
  });

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/messages/admin");
      setMessages(data.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  React.useEffect(() => {
    fetchMessages();
  }, []);

  // ==========================================
  // ESTADÍSTICAS Y FILTROS
  // ==========================================
  const totalMessages = messages.length;
  const unreadMessages = messages.filter((m) => m.status === "UNREAD").length;
  const repliedMessages = messages.filter((m) => m.status === "REPLIED").length;

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "TODOS" ||
      (filterStatus === "UNREAD" && msg.status === "UNREAD") ||
      (filterStatus === "REPLIED" && msg.status === "REPLIED");
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // LÓGICA DE MENSAJES Y RESPUESTAS
  // ==========================================

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    setReplyText("");

    if (msg.status === "UNREAD") {
      try {
        await api.patch(`/messages/admin/${msg.id}/status`, { status: "READ" });
        setMessages(
          messages.map((m) => (m.id === msg.id ? { ...m, status: "READ" } : m)),
        );
        setSelectedMessage({ ...msg, status: "READ" });
      } catch (error) {
        console.error("Error update message status:", error);
      }
    }
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      await api.post(`/messages/admin/${selectedMessage.id}/reply`, {
        reply_text: replyText,
        subject: `Re: ${selectedMessage.subject || "Consulta NexusHub"}`,
      });

      // Update local state
      const updatedMessages = messages.map((m) => {
        if (m.id === selectedMessage.id) {
          return {
            ...m,
            status: "REPLIED",
            replied_at: new Date().toISOString(),
          };
        }
        return m;
      });

      setMessages(updatedMessages);
      setSelectedMessage(null); // Cerramos el visor
      setReplyText("");

      setModalConfig({
        isOpen: true,
        type: "success",
        message:
          "Respuesta enviada. El usuario recibirá un correo y, si aplica, una notificación nativa.",
      });
    } catch (error) {
      console.error("Error send reply:", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Ocurrió un error enviando la respuesta.",
      });
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: "confirm-delete",
      message:
        "¿Estás seguro de que deseas eliminar este formulario de contacto?",
      targetId: id,
    });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/messages/admin/${modalConfig.targetId}`);
      setMessages(messages.filter((m) => m.id !== modalConfig.targetId));
      if (selectedMessage && selectedMessage.id === modalConfig.targetId) {
        setSelectedMessage(null);
      }
      setModalConfig({
        isOpen: true,
        type: "success",
        message: "Mensaje eliminado permanentemente de la bandeja.",
        targetId: null,
      });
    } catch (error) {
      console.error("Error delete message", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Ocurrió un error al intentar eliminar el mensaje.",
        targetId: null,
      });
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <div className="am-container">
      {/* MODAL GLOBAL DEL SISTEMA */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type.includes("confirm") ? (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              ) : (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
            </div>
            <h3 className="modal-title">
              {modalConfig.type.includes("confirm")
                ? "Confirmar Acción"
                : "¡Éxito!"}
            </h3>
            <p className="modal-message">{modalConfig.message}</p>
            <div className="modal-actions">
              {modalConfig.type.includes("confirm") && (
                <button className="btn-modal btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
              )}
              <button
                className="btn-modal btn-accept"
                onClick={
                  modalConfig.type === "confirm-delete"
                    ? confirmDelete
                    : closeModal
                }
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISOR DE MENSAJE Y REDACCIÓN */}
      {selectedMessage && (
        <div className="am-message-overlay">
          <div className="am-message-box">
            <div className="am-msg-header">
              <div className="am-msg-header-titles">
                <span className="am-msg-badge">
                  {selectedMessage.status === "REPLIED"
                    ? "Respondido"
                    : "Leído"}
                </span>
                <h3>{selectedMessage.subject}</h3>
              </div>
              <button className="am-msg-close" onClick={handleCloseMessage}>
                &times;
              </button>
            </div>

            <div className="am-msg-body">
              {/* INFO DEL CLIENTE */}
              <div className="am-client-info">
                <div className="am-client-avatar">
                  <FaUser />
                </div>
                <div className="am-client-details">
                  <strong>{selectedMessage.name}</strong>
                  <span>
                    <FaEnvelope className="am-small-icon" />{" "}
                    {selectedMessage.email}
                  </span>
                  <span>
                    <FaPhoneAlt className="am-small-icon" />{" "}
                    {selectedMessage.phone}
                  </span>
                </div>
                <div className="am-msg-date">
                  {new Date(selectedMessage.created_at).toLocaleString(
                    "es-ES",
                    { dateStyle: "medium", timeStyle: "short" },
                  )}
                </div>
              </div>

              {/* MENSAJE DEL FORMULARIO */}
              <div className="am-original-message">
                <span className="am-label-title">Mensaje del cliente:</span>
                <p>{selectedMessage.message}</p>
              </div>

              {/* ÁREA DE RESPUESTA O RESPUESTA YA ENVIADA */}
              {selectedMessage.status === "REPLIED" ? (
                <div className="am-admin-response">
                  <span className="am-label-title">
                    <FaCheck style={{ marginRight: "5px" }} /> Respuesta enviada
                    exitosamente:
                  </span>
                  <p className="am-text-muted">
                    La hora de respuesta a la consulta se registró el{" "}
                    {new Date(selectedMessage.replied_at).toLocaleString(
                      "es-ES",
                      { dateStyle: "medium", timeStyle: "short" },
                    )}{" "}
                    vía correo electrónico.
                  </p>
                </div>
              ) : (
                <div className="am-reply-section">
                  <label>
                    <FaReply style={{ marginRight: "5px" }} /> Redactar
                    respuesta:
                  </label>
                  <textarea
                    className="am-reply-textarea"
                    rows="4"
                    placeholder="Escribe aquí tu respuesta. El usuario recibirá una notificación..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                </div>
              )}
            </div>

            <div className="am-msg-footer">
              <button className="am-btn-cancel" onClick={handleCloseMessage}>
                Cerrar Visor
              </button>
              {selectedMessage.status !== "REPLIED" && (
                <button
                  className={`am-btn-accept ${!replyText.trim() ? "disabled" : ""}`}
                  disabled={!replyText.trim()}
                  onClick={handleSendReply}
                >
                  <FaPaperPlane style={{ marginRight: "8px" }} /> Enviar
                  Respuesta
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE LA VISTA INBOX */}
      <div className="am-header">
        <div className="am-title-group">
          <h1 className="am-title">Bandeja de Mensajes</h1>
          <h2 className="am-subtitle">
            Gestiona y responde los formularios de contacto de tus prospectos
          </h2>
        </div>
      </div>

      <div className="am-stats-bar">
        <div className="am-stat-item">
          <span className="am-stat-label">Total Mensajes</span>
          <span className="am-stat-value">{totalMessages}</span>
        </div>
        <div className="am-stat-item">
          <span className="am-stat-label">Sin Leer</span>
          <span className="am-stat-value am-text-red">{unreadMessages}</span>
        </div>
        <div className="am-stat-item">
          <span className="am-stat-label">Respondidos</span>
          <span className="am-stat-value am-text-green">{repliedMessages}</span>
        </div>
      </div>

      <div className="am-toolbar">
        <div className="am-search-bar">
          <FaSearch className="am-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o asunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="am-filter-bar">
          <FaFilter className="am-search-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="am-filter-select"
          >
            <option value="TODOS">Todos los mensajes</option>
            <option value="UNREAD">Solo No Leídos</option>
            <option value="REPLIED">Respondidos</option>
          </select>
        </div>
      </div>

      <div className="am-table-container">
        <table className="am-table">
          <thead>
            <tr>
              <th className="am-th-status">Est.</th>
              <th>Contacto</th>
              <th>Asunto y Mensaje</th>
              <th className="am-hide-mobile">Fecha</th>
              <th className="am-th-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => {
                const isUnread = msg.status === "UNREAD";

                return (
                  <tr
                    key={msg.id}
                    className={`am-tr-message ${isUnread ? "am-tr-unread" : ""}`}
                    onClick={() => handleOpenMessage(msg)}
                  >
                    <td className="am-th-status">
                      <div className="am-status-icon" title={msg.status}>
                        {msg.status === "UNREAD" ? (
                          <FaEnvelope className="am-text-corp" />
                        ) : msg.status === "REPLIED" ? (
                          <FaReply className="am-text-green" />
                        ) : (
                          <FaEnvelopeOpen className="am-text-gray" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="am-td-contact">
                        <strong className={isUnread ? "am-text-bold" : ""}>
                          {msg.name}
                        </strong>
                        <span>{msg.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="am-td-content">
                        <strong className={isUnread ? "am-text-bold" : ""}>
                          {msg.subject}
                        </strong>
                        <span className="am-text-truncate">{msg.message}</span>
                      </div>
                    </td>
                    <td className="am-hide-mobile">
                      <span
                        className={`am-date-text ${isUnread ? "am-text-bold" : ""}`}
                      >
                        {new Date(msg.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>
                    <td className="am-col-actions">
                      <button
                        className="am-btn-icon am-delete"
                        onClick={(e) => handleDeleteClick(e, msg.id)}
                        title="Eliminar Mensaje"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="am-no-data">
                  No se encontraron mensajes en la bandeja.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMensajes;
