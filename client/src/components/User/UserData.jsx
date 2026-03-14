// src/components/User/UserData/UserData.jsx
import React, { useState } from "react";
import {
  FaUserCircle,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./UserData.css";

const UserData = () => {
  // 1. Estados para los datos del usuario (Listos para backend)
  const [formData, setFormData] = useState({
    nombres: "Sofia",
    apellidos: "Nolasco",
    pais: "Perú",
    gmail: "qwert@gmail.com",
    telefono: "000 000 000",
    avisos: false,
  });

  // 2. Estado para el modo edición (bloqueado/desbloqueado)
  const [isEditing, setIsEditing] = useState(false);

  // 3. Estado para manejar las alertas personalizadas (Modal)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "", // 'confirm' o 'success'
    message: "",
  });

  // Maneja los cambios al escribir en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Botón "Editar": Activa el modo edición
  const handleEditClick = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  // Botón "Guardar cambios": Abre la alerta de confirmación
  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!isEditing) return; // Si no está editando, no hace nada

    setModalConfig({
      isOpen: true,
      type: "confirm",
      message:
        "¿Estás seguro de que deseas guardar estos cambios en tu perfil?",
    });
  };

  // Confirmar y simular envío al backend
  const confirmSave = () => {
    // AQUÍ VA TU LÓGICA DE BACKEND (ej. fetch o axios)
    // console.log("Enviando a backend:", formData);

    // Mostramos la alerta de éxito
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Tus datos se han actualizado correctamente.",
    });

    // Bloqueamos de nuevo los inputs
    setIsEditing(false);
  };

  return (
    <div className="userdata-container">
      {/* --- MODAL PERSONALIZADO (ALERTA) --- */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type === "confirm" ? (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              ) : (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
            </div>
            <h3 className="modal-title">
              {modalConfig.type === "confirm" ? "Confirmar Acción" : "¡Éxito!"}
            </h3>
            <p className="modal-message">{modalConfig.message}</p>

            <div className="modal-actions">
              {modalConfig.type === "confirm" && (
                <button
                  className="btn-modal btn-cancel"
                  onClick={() =>
                    setModalConfig({ ...modalConfig, isOpen: false })
                  }
                >
                  Cancelar
                </button>
              )}
              <button
                className="btn-modal btn-accept"
                onClick={
                  modalConfig.type === "confirm"
                    ? confirmSave
                    : () => setModalConfig({ ...modalConfig, isOpen: false })
                }
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENIDO DEL USUARIO --- */}
      <div className="userdata-header">
        <FaUserCircle className="userdata-avatar" />
        <div className="userdata-title-group">
          <h1 className="userdata-welcome">Bienvenido</h1>
          <h2 className="userdata-name">
            {formData.nombres} {formData.apellidos}
          </h2>
        </div>
      </div>

      <h3 className="section-subtitle">Datos del usuario</h3>

      <div className="userdata-form-grid">
        {/* Usamos clases dinámicas para el estilo: "locked" o "editable" */}
        <div className={`input-box ${isEditing ? "editable" : "locked"}`}>
          <span className="input-label">Nombres:</span>
          <input
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className={`input-box ${isEditing ? "editable" : "locked"}`}>
          <span className="input-label">Apellidos:</span>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className={`input-box ${isEditing ? "editable" : "locked"}`}>
          <span className="input-label">País:</span>
          <input
            type="text"
            name="pais"
            value={formData.pais}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className={`input-box ${isEditing ? "editable" : "locked"}`}>
          <span className="input-label">Gmail:</span>
          <input
            type="email"
            name="gmail"
            value={formData.gmail}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className={`input-box ${isEditing ? "editable" : "locked"}`}>
          <span className="input-label">Teléfono:</span>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="edit-button-container">
          <button
            className={`btn-edit ${isEditing ? "active-edit" : ""}`}
            onClick={handleEditClick}
          >
            {isEditing ? "Editando..." : "Editar"}{" "}
            <FaEdit className="btn-icon" />
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-subtitle">Configuración de Avisos</h3>
        <label
          className={`checkbox-container ${!isEditing ? "locked-checkbox" : ""}`}
        >
          <input
            type="checkbox"
            name="avisos"
            checked={formData.avisos}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          <span className="checkbox-text">
            Enviarme avisos de nuevos inmuebles similares a mis favoritos
          </span>
        </label>
      </div>

      <button
        className={`btn-save ${!isEditing ? "disabled" : ""}`}
        onClick={handleSaveClick}
      >
        Guardar cambios
      </button>
    </div>
  );
};

export default UserData;
