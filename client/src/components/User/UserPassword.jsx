// src/components/User/UserPassword/UserPassword.jsx
import React, { useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import candado from "../../assets/img/icons/userCuenta/candado.png";
import api from "../../api/api";

import "./UserPassword.css";

const UserPassword = () => {
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    repetir: "",
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveClick = (e) => {
    e.preventDefault();

    if (!passwords.nueva || !passwords.repetir) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Por favor, completa todos los campos antes de guardar.",
      });
      return;
    }

    if (passwords.nueva !== passwords.repetir) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Las contraseñas nuevas no coinciden. Inténtalo de nuevo.",
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      type: "confirm",
      message: "¿Estás seguro de que deseas cambiar tu contraseña?",
    });
  };

  const confirmSave = async () => {
    try {
      const response = await api.patch("/users/me", {
        currentPassword: passwords.actual,
        newPassword: passwords.nueva,
      });

      setModalConfig({
        isOpen: true,
        type: "success",
        message:
          response.data?.message ||
          "Revisa tu correo actual para confirmar el cambio.",
      });

      setPasswords({ actual: "", nueva: "", repetir: "" });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message:
          error.response?.data?.error ||
          "Ocurrió un error al actualizar la contraseña.",
      });
    }
  };

  return (
    <div className="user-password-container">
      {/* MODAL */}
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

      {/* HEADER */}
      <div className="password-header">
        <img src={candado} alt="candado" className="password-icon" />
        <h1 className="password-title">Cambiar contraseña</h1>
      </div>

      {/* FORM */}
      <form className="password-form" onSubmit={handleSaveClick}>
        <div className="password-row">
          <div className="form-group half-width" style={{ width: "100%" }}>
            <label className="form-label">Contraseña actual</label>
            <input
              type="password"
              name="actual"
              placeholder="123456"
              value={passwords.actual}
              onChange={handleInputChange}
            />
          </div>
        </div>
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
