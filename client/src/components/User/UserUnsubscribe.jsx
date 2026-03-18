// src/components/User/UserUnsubscribe/UserUnsubscribe.jsx
import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

// IMAGEN IMPORTADA PARA REEMPLAZAR FaUserTimes
import eliminar from "../../assets/img/icons/userCuenta/eliminar.png";

import "./UserUnsubscribe.css";

const UserUnsubscribe = () => {
  const [secciones, setSecciones] = useState({
    alertas: false,
    anuncios: false,
    cuenta: false,
  });

  const [confirmText, setConfirmText] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "", // 'error', 'confirm-normal', 'confirm-critical', 'success'
    message: "",
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSecciones((prev) => ({ ...prev, [name]: checked }));
  };

  const handleActionClick = () => {
    // 1. Validar que al menos haya una opción marcada
    if (!secciones.alertas && !secciones.anuncios && !secciones.cuenta) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Por favor, seleccione al menos una opción.",
      });
      return;
    }

    // 2. Lógica Inteligente según el contexto de lo seleccionado
    if (secciones.cuenta) {
      // Si eligió borrar la cuenta, es crítico. Pedimos escribir ELIMINAR.
      setConfirmText("");
      setModalConfig({
        isOpen: true,
        type: "confirm-critical",
        message:
          "Estás a punto de eliminar tu cuenta permanentemente. Para confirmar, escribe la palabra ELIMINAR abajo:",
      });
    } else {
      // Si solo son alertas o anuncios, es una confirmación normal.
      setModalConfig({
        isOpen: true,
        type: "confirm-normal",
        message:
          "¿Estás seguro de que deseas aplicar estos cambios en tu cuenta?",
      });
    }
  };

  const handleFinalAction = () => {
    // Si es una acción crítica, verificamos el texto
    if (modalConfig.type === "confirm-critical" && confirmText !== "ELIMINAR") {
      return;
    }

    // Simulación de éxito
    setModalConfig({
      isOpen: true,
      type: "success",
      message: secciones.cuenta
        ? "Tu cuenta ha sido eliminada con éxito."
        : "Tus preferencias se han actualizado correctamente.",
    });

    // Si no eliminó la cuenta, limpiamos los checkboxes tras el éxito
    if (!secciones.cuenta) {
      setSecciones({ alertas: false, anuncios: false, cuenta: false });
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <div className="unsubscribe-container">
      {/* --- MODAL DE SISTEMA --- */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {(modalConfig.type === "confirm-critical" ||
                modalConfig.type === "confirm-normal") && (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              )}
              {modalConfig.type === "success" && (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
              {modalConfig.type === "error" && (
                <FaExclamationCircle className="modal-icon error-icon" />
              )}
            </div>

            <h3 className="modal-title">
              {modalConfig.type.includes("confirm")
                ? "Confirmación"
                : modalConfig.type === "success"
                  ? "¡Éxito!"
                  : "Aviso"}
            </h3>

            <p className="modal-message">{modalConfig.message}</p>

            {/* Solo mostramos el input si es una eliminación CRÍTICA */}
            {modalConfig.type === "confirm-critical" && (
              <div className="modal-input-container">
                <input
                  type="text"
                  className="modal-verify-input"
                  placeholder="Escriba ELIMINAR"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>
            )}

            <div className="modal-actions">
              {modalConfig.type.includes("confirm") ? (
                <>
                  <button className="btn-modal btn-cancel" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    className="btn-modal btn-accept"
                    onClick={handleFinalAction}
                    disabled={
                      modalConfig.type === "confirm-critical" &&
                      confirmText !== "ELIMINAR"
                    }
                    style={{
                      opacity:
                        modalConfig.type === "confirm-critical" &&
                        confirmText !== "ELIMINAR"
                          ? 0.5
                          : 1,
                    }}
                  >
                    Aceptar
                  </button>
                </>
              ) : (
                <button className="btn-modal btn-accept" onClick={closeModal}>
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CABECERA CON EL BOTÓN A LA DERECHA --- */}
      <div className="unsubscribe-header">
        <div className="header-title-group">
          {/* REEMPLAZO DEL ICONO POR LA IMAGEN IMPORTADA */}
          <img
            src={eliminar}
            alt="Dar de baja"
            className="unsubscribe-title-icon-img"
          />
          <h1 className="unsubscribe-title">Darme de baja</h1>
        </div>

        <button className="btn-unsubscribe-main" onClick={handleActionClick}>
          Dar de baja
        </button>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="unsubscribe-card">
        <h2 className="section-question">¿Qué desea dar de baja?</h2>

        <div className="options-list">
          <label className="custom-checkbox-container">
            <input
              type="checkbox"
              name="alertas"
              checked={secciones.alertas}
              onChange={handleCheckboxChange}
            />
            <span className="checkmark"></span>
            Desactivar todas las alertas
          </label>

          <label className="custom-checkbox-container">
            <input
              type="checkbox"
              name="anuncios"
              checked={secciones.anuncios}
              onChange={handleCheckboxChange}
            />
            <span className="checkmark"></span>
            Borrar anuncios
          </label>

          <label className="custom-checkbox-container">
            <input
              type="checkbox"
              name="cuenta"
              checked={secciones.cuenta}
              onChange={handleCheckboxChange}
            />
            <span className="checkmark"></span>
            Dar de baja a la cuenta
          </label>
        </div>
      </div>
    </div>
  );
};

export default UserUnsubscribe;
