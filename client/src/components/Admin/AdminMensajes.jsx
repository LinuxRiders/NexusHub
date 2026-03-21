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
  FaHeadset,
} from "react-icons/fa";
import "./AdminMensajes.css";

// Mock de datos con soporte para "Hilos de conversación" (replies)
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
    replies: [], // Sin respuestas aún
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
    replies: [],
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
    replies: [
      {
        id: 301,
        text: "Hola Carlos, ¡gracias por contactarnos! Sí, tenemos 3 opciones que se ajustan a tu perfil. Te acabo de adjuntar el PDF a tu correo con los detalles.",
        date: "18 Mar, 10:15 AM",
        sender: "admin",
      },
    ],
  },
];

const AdminMensajes = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  // Estado para el visor de mensajes (Hilo)
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
    // Si estaba "NO LEÍDO", lo pasamos a "LEÍDO"
    if (msg.status === "UNREAD") {
      const updatedMessages = messages.map((m) =>
        m.id === msg.id ? { ...m, status: "READ" } : m,
      );
      setMessages(updatedMessages);
      // Actualizamos también la referencia actual para que el modal no lo siga viendo como UNREAD
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

    // Creamos el objeto de la nueva respuesta
    const newReply = {
      id: Date.now(),
      text: replyText,
      date: "Justo ahora",
      sender: "admin",
    };

    // Actualizamos el mensaje en el listado general añadiendo el reply y cambiando el status
    const updatedMessages = messages.map((m) => {
      if (m.id === selectedMessage.id) {
        return {
          ...m,
          status: "REPLIED",
          replies: [...m.replies, newReply],
        };
      }
      return m;
    });

    setMessages(updatedMessages);

    // Actualizamos el modal actual para ver la respuesta inmediatamente sin cerrarlo
    setSelectedMessage({
      ...selectedMessage,
      status: "REPLIED",
      replies: [...selectedMessage.replies, newReply],
    });

    setReplyText(""); // Limpiamos la caja de texto
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: "confirm-delete",
      message:
        "¿Estás seguro de que deseas eliminar este hilo de conversación?",
      targetId: id,
    });
  };

  const confirmDelete = () => {
    setMessages(messages.filter((m) => m.id !== modalConfig.targetId));
    if (selectedMessage && selectedMessage.id === modalConfig.targetId) {
      setSelectedMessage(null); // Cerrar modal si estaba abierto
    }
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Mensaje eliminado.",
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

      {/* MODAL VISOR DE MENSAJE E HILO DE CONVERSACIÓN */}
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
              </div>

              {/* HILO DE CONVERSACIÓN (SCROLLABLE) */}
              <div className="am-thread-container">
                {/* 1. Mensaje Inicial del Cliente */}
                <div className="am-bubble-row client-row">
                  <div className="am-bubble am-bubble-client">
                    <p>{selectedMessage.message}</p>
                    <span className="am-bubble-time">
                      {selectedMessage.date}
                    </span>
                  </div>
                </div>

                {/* 2. Respuestas del Administrador */}
                {selectedMessage.replies.map((reply) => (
                  <div key={reply.id} className="am-bubble-row admin-row">
                    <div className="am-bubble am-bubble-admin">
                      <p>{reply.text}</p>
                      <span className="am-bubble-time">
                        <FaHeadset style={{ marginRight: "4px" }} />{" "}
                        {reply.date} - Tú
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ÁREA DE REDACCIÓN */}
              <div className="am-reply-section">
                <label>
                  <FaReply style={{ marginRight: "5px" }} />{" "}
                  {selectedMessage.replies.length > 0
                    ? "Añadir otra respuesta:"
                    : "Redactar respuesta:"}
                </label>
                <textarea
                  className="am-reply-textarea"
                  rows="3"
                  placeholder="Escribe tu respuesta aquí para el cliente..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="am-msg-footer">
              <button className="am-btn-cancel" onClick={handleCloseMessage}>
                Cerrar Visor
              </button>
              <button
                className={`am-btn-accept ${!replyText.trim() ? "disabled" : ""}`}
                disabled={!replyText.trim()}
                onClick={handleSendReply}
              >
                <FaPaperPlane style={{ marginRight: "8px" }} /> Enviar a{" "}
                {selectedMessage.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE LA VISTA INBOX */}
      <div className="am-header">
        <div className="am-title-group">
          <h1 className="am-title">Bandeja de Mensajes</h1>
          <h2 className="am-subtitle">
            Gestiona y responde las consultas de tus prospectos (Leads)
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
                        title="Eliminar Hilo"
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
