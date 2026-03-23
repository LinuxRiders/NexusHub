// src/components/User/UserData/UserData.jsx
import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import "./UserData.css";
import login from "../../assets/img/icons/userCuenta/login.png";
import { useAuth } from "../../context/AuthProvider";
import api from "../../api/api";
import countries from "i18n-iso-countries";
import esLocale from "i18n-iso-countries/langs/es.json";

countries.registerLocale(esLocale);
const countryObj = countries.getNames("es", { select: "official" });
const countryList = Object.entries(countryObj)
  .map(([key, value]) => ({
    value: key,
    label: value,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const UserData = () => {
  const { user } = useAuth(); // Extraemos user del context

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    pais: "",
    email: "",
    telefono: "",
    avisos: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Precargar formData cuando the user changes
  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        pais: user.pais || "",
        email: user.email || "",
        telefono: user.telefono || "",
        avisos: false,
      });
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleSaveClick = (e) => {
    e.preventDefault();

    if (!isEditing) return;

    setModalConfig({
      isOpen: true,
      type: "confirm",
      message:
        "¿Estás seguro de que deseas guardar estos cambios en tu perfil?",
    });
  };

  const confirmSave = async () => {
    setIsLoading(true);
    try {
      // Patch al nuevo endpoint (asume /users/me según routes)
      const payload = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        pais: formData.pais,
        email: formData.email,
        telefono: formData.telefono,
      };

      const response = await api.patch("/users/me", payload);

      setModalConfig({
        isOpen: true,
        type: "success",
        message:
          response.data.message ||
          "Tus datos se han actualizado correctamente.",
      });

      setIsEditing(false);
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error", // Necesitamos soportar type="error" en el render o mapearlo a confirm
        message:
          error.response?.data?.error || "Error al actualizar los datos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="userdata-container">
      {/* MODAL */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type === "confirm" ? (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              ) : modalConfig.type === "success" ? (
                <FaCheckCircle className="modal-icon success-icon" />
              ) : (
                <FaTimesCircle className="modal-icon error-icon" />
              )}
            </div>

            <h3 className="modal-title">
              {modalConfig.type === "confirm"
                ? "Confirmar Acción"
                : modalConfig.type === "error"
                  ? "Error"
                  : "¡Éxito!"}
            </h3>

            <p className="modal-message">{modalConfig.message}</p>

            <div className="modal-actions">
              {modalConfig.type === "confirm" && (
                <button
                  className="btn-modal btn-cancel"
                  disabled={isLoading}
                  onClick={() =>
                    setModalConfig({ ...modalConfig, isOpen: false })
                  }
                >
                  Cancelar
                </button>
              )}

              <button
                className={`btn-modal ${modalConfig.type === "error" ? "btn-cancel" : "btn-accept"}`}
                disabled={isLoading}
                onClick={
                  modalConfig.type === "confirm"
                    ? confirmSave
                    : () => {
                        setModalConfig({ ...modalConfig, isOpen: false });
                        if (modalConfig.type === "success")
                          window.location.reload(); // Quick refresh to update context
                      }
                }
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Aceptar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="userdata-header">
        <img src={login} alt="usuario" className="userdata-avatar" />

        <div className="userdata-title-group">
          <h1 className="userdata-welcome">Bienvenido</h1>

          <h2 className="userdata-name">
            {formData.nombres} {formData.apellidos}
          </h2>
        </div>
      </div>

      <h3 className="section-subtitle">Datos del usuario</h3>

      <div className="userdata-form-grid">
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
          {isEditing ? (
            <select
              name="pais"
              value={formData.pais || ""}
              onChange={handleInputChange}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                color: "inherit",
                border: "none",
                outline: "none",
                fontSize: "inherit",
                fontFamily: "inherit",
                padding: "0",
              }}
            >
              <option value="" disabled>
                Seleccione un país
              </option>
              {countryList.map((c) => (
                <option key={c.value} value={c.label} style={{ color: "#333" }}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="pais"
              value={formData.pais || "No especificado"}
              readOnly
            />
          )}
        </div>

        <div className={`input-box ${isEditing ? "editable" : "locked"}`}>
          <span className="input-label">Email:</span>
          <input
            type="email"
            name="email"
            value={formData.email}
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
            {isEditing ? "Editando..." : "Editar"}
            <FaEdit className="btn-icon" />
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-subtitle">Configuración de Avisos</h3>

        <label
          className={`checkbox-container ${
            !isEditing ? "locked-checkbox" : ""
          }`}
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
