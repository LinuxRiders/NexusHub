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
import "./AdminMensajes.css";

// Mock de datos adaptado a "Una sola respuesta"
const initialMessages = [
  {
    id: 1,
    name: "Luis Ramírez",
    email: "luis.ramirez@gmail.com",
    phone: "987 654 321",
    subject: "Consulta sobre Dpto. Av. España 123",
    message:
      "Hola, estoy muy interesado en agendar una visita para este departamento. ¿Tienen disponibilidad para este fin de semana por la mañana? Quedo atento a su respuesta.",
    date: "Hoy, 10:30 AM",
    status: "UNREAD",
    adminReply: null, // Sin respuesta aún
  },
  {
    id: 2,
    name: "María Gómez",
    email: "maria.gomez88@hotmail.com",
    phone: "912 345 678",
    subject: "Información de financiamiento - Casa Fátima",
    message:
      "Buen día. Me gustaría saber si aceptan crédito hipotecario con el BCP para la casa ubicada en la Av. Fátima. Gracias.",
    date: "Ayer, 04:15 PM",
    status: "READ",
    adminReply: null,
  },
  {
    id: 3,
    name: "Carlos Villalobos",
    email: "carlos.v@empresa.com",
    phone: "998 877 665",
    subject: "Busco oficina en alquiler",
    message:
      "Estimados, estoy buscando una oficina de al menos 100m2 en el centro histórico. ¿Tienen opciones disponibles en su catálogo actual?",
    date: "18 Mar, 09:00 AM",
    status: "REPLIED",
    adminReply:
      "Hola Carlos, ¡gracias por contactarnos! Sí, tenemos 3 opciones que se ajustan a tu perfil. Te acabo de enviar la información a tu correo con los detalles.",
  },
];

const AdminMensajes = () => {
  const [messages, setMessages] = useState(initialMessages);
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

  const handleOpenMessage = (msg) => {
    if (msg.status === "UNREAD") {
      const updatedMessages = messages.map((m) =>
        m.id === msg.id ? { ...m, status: "READ" } : m,
      );
      setMessages(updatedMessages);
      setSelectedMessage({ ...msg, status: "READ" });
    } else {
      setSelectedMessage(msg);
    }
    setReplyText("");
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
    setReplyText("");
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    // Actualizamos el mensaje guardando la respuesta única y cambiando el estado a REPLIED
    const updatedMessages = messages.map((m) => {
      if (m.id === selectedMessage.id) {
        return {
          ...m,
          status: "REPLIED",
          adminReply: replyText,
        };
      }
      return m;
    });

    setMessages(updatedMessages);
    setSelectedMessage(null); // Cerramos el visor
    setReplyText("");

    // Mostramos la alerta de éxito
    setModalConfig({
      isOpen: true,
      type: "success",
      message:
        "Respuesta enviada. El usuario recibirá una notificación con tu mensaje.",
    });
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

  const confirmDelete = () => {
    setMessages(messages.filter((m) => m.id !== modalConfig.targetId));
    if (selectedMessage && selectedMessage.id === modalConfig.targetId) {
      setSelectedMessage(null);
    }
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Mensaje eliminado de la bandeja.",
      targetId: null,
    });
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
                <div className="am-msg-date">{selectedMessage.date}</div>
              </div>

              {/* MENSAJE DEL FORMULARIO */}
              <div className="am-original-message">
                <span className="am-label-title">Mensaje del cliente:</span>
                <p>{selectedMessage.message}</p>
              </div>

              {/* ÁREA DE RESPUESTA O RESPUESTA YA ENVIADA */}
              {selectedMessage.status === "REPLIED" &&
              selectedMessage.adminReply ? (
                <div className="am-admin-response">
                  <span className="am-label-title">
                    <FaCheck style={{ marginRight: "5px" }} /> Tu respuesta
                    enviada:
                  </span>
                  <p>{selectedMessage.adminReply}</p>
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
                        {msg.date}
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
