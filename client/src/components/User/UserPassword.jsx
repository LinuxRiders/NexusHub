// src/components/User/UserPassword/UserPassword.jsx
import React, { useState } from "react";
import {
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import "./UserPassword.css";

const UserPassword = () => {
  // 1. Estado para los inputs de contraseña
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    repetir: "",
  });

  // 2. Estado para manejar las alertas modales
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "", // 'confirm', 'success', o 'error'
    message: "",
  });

  // Manejador de cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validación y confirmación antes de guardar
  const handleSaveClick = (e) => {
    e.preventDefault();

    // Validación 1: Campos vacíos
    if (!passwords.actual || !passwords.nueva || !passwords.repetir) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Por favor, completa todos los campos antes de guardar.",
      });
      return;
    }

    // Validación 2: Las contraseñas nuevas deben coincidir
    if (passwords.nueva !== passwords.repetir) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Las contraseñas nuevas no coinciden. Inténtalo de nuevo.",
      });
      return;
    }

    // Si todo está bien, mostramos la confirmación
    setModalConfig({
      isOpen: true,
      type: "confirm",
      message: "¿Estás seguro de que deseas cambiar tu contraseña?",
    });
  };

  // Simulación de envío al backend y éxito
  const confirmSave = () => {
    // AQUÍ VA TU LÓGICA DE BACKEND (ej. axios.post('/api/change-password', passwords))

    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Tu contraseña se ha actualizado correctamente.",
    });

    // Limpiamos los campos después de un guardado exitoso
    setPasswords({ actual: "", nueva: "", repetir: "" });
  };

  return (
    <div className="user-password-container">
      {/* --- MODAL DE ALERTA --- */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type === "confirm" && (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              )}
              {modalConfig.type === "success" && (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
              {modalConfig.type === "error" && (
                <FaTimesCircle className="modal-icon error-icon" />
              )}
            </div>
            <h3 className="modal-title">
              {modalConfig.type === "confirm" && "Confirmar Cambio"}
              {modalConfig.type === "success" && "¡Éxito!"}
              {modalConfig.type === "error" && "Error"}
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
                {modalConfig.type === "error" ? "Entendido" : "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENIDO DEL PANEL --- */}
      <div className="password-header">
        <FaLock className="password-icon" />
        <h1 className="password-title">Cambiar contraseña</h1>
      </div>

      <form className="password-form" onSubmit={handleSaveClick}>
        {/* Contraseña Actual */}
        <div className="form-group full-width">
          <label className="form-label">Contraseña actual</label>
          <input
            type="password"
            name="actual"
            placeholder="abcdefg"
            value={passwords.actual}
            onChange={handleInputChange}
          />
        </div>

        {/* Fila con las contraseñas nuevas */}
        <div className="password-row">
          <div className="form-group half-width">
            <label className="form-label">Contraseña nueva</label>
            <input
              type="password"
              name="nueva"
              placeholder="123456"
              value={passwords.nueva}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group half-width">
            <label className="form-label">Repetir contraseña nueva</label>
            <input
              type="password"
              name="repetir"
              placeholder="123456"
              value={passwords.repetir}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <button type="submit" className="btn-save-password">
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default UserPassword;
