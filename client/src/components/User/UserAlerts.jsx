// src/components/User/UserAlerts/UserAlerts.jsx
import React, { useState } from "react";
import {
  FaBell,
  FaTimes,
  FaEdit,
  FaTrashAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

// 1. IMPORTACIÓN DE IMAGEN CORREGIDA
import marcaAgua from "../../assets/img/MarcaAgua.png";

import "./UserAlerts.css";

// Lista de tipos de inmuebles disponibles para la propuesta funcional
const propertyTypesOptions = [
  "Departamento",
  "Casa",
  "Oficina",
  "Local Comercial",
  "Terreno",
  "Almacén",
];
// Lista de ubicaciones para el selector
const locationsOptions = [
  "Trujillo (Centro)",
  "Víctor Larco Herrera",
  "Huanchaco",
  "La Esperanza",
  "Florencia de Mora",
  "Moche",
];

const initialAlertState = {
  id: null,
  titulo: "",
  compra: false,
  alquiler: false,
  habitaciones: "",
  precioMin: "",
  precioMax: "",
  banos: "",
  superficieMin: "",
  superficieMax: "",
  conFotografias: false,
  ubicacion: "", // Ahora guardará el valor seleccionado
  tipoInmuebleTags: [], // NUEVO: Guardará array de strings ['Casa', 'Dpto']
  enviarNuevos: false,
};

const UserAlerts = () => {
  const [alertsList, setAlertsList] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialAlertState);
  const [systemAlert, setSystemAlert] = useState({
    isOpen: false,
    type: "",
    message: "",
    action: null,
  });

  // Estado para controlar la visibilidad del selector rápido de "Añadir tipo"
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- LÓGICA FUNCIONAL PARA "AÑADIR TIPO" (TAGS) ---
  const addPropertyTypeTag = (type) => {
    if (type && !formData.tipoInmuebleTags.includes(type)) {
      setFormData((prev) => ({
        ...prev,
        tipoInmuebleTags: [...prev.tipoInmuebleTags, type],
      }));
    }
    setShowTypeSelector(false); // Cierra el selector tras añadir
  };

  const removePropertyTypeTag = (typeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tipoInmuebleTags: prev.tipoInmuebleTags.filter(
        (type) => type !== typeToRemove,
      ),
    }));
  };
  // --------------------------------------------------

  const openNewAlertModal = () => {
    setFormData(initialAlertState);
    setShowTypeSelector(false);
    setIsFormModalOpen(true);
  };

  const openEditAlertModal = (alert) => {
    setFormData(alert);
    setShowTypeSelector(false);
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      setSystemAlert({
        isOpen: true,
        type: "error",
        message: "El título de la alerta es obligatorio.",
      });
      return;
    }
    setSystemAlert({
      isOpen: true,
      type: "confirm",
      message: formData.id
        ? "¿Guardar los cambios?"
        : "¿Deseas crear esta alerta?",
      action: () => confirmSaveAlert(),
    });
  };

  const confirmSaveAlert = () => {
    if (formData.id) {
      setAlertsList(
        alertsList.map((a) => (a.id === formData.id ? formData : a)),
      );
    } else {
      setAlertsList([...alertsList, { ...formData, id: Date.now() }]);
    }
    setIsFormModalOpen(false);
    setSystemAlert({
      isOpen: true,
      type: "success",
      message: "Alerta gestionada correctamente.",
    });
  };

  const handleDeleteClick = (id) => {
    setSystemAlert({
      isOpen: true,
      type: "confirm",
      message: "¿Eliminar esta alerta definitivamente?",
      action: () => confirmDeleteAlert(id),
    });
  };

  const confirmDeleteAlert = (id) => {
    setAlertsList(alertsList.filter((a) => a.id !== id));
    setSystemAlert({ isOpen: false });
  };

  return (
    <div className="user-alerts-container">
      {/* --- MODALES DE SISTEMA --- */}
      {systemAlert.isOpen && (
        <div className="custom-modal-overlay system-alert-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {systemAlert.type === "confirm" && (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              )}
              {systemAlert.type === "success" && (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
              {systemAlert.type === "error" && (
                <FaTimes className="modal-icon error-icon" />
              )}
            </div>
            <h3 className="modal-title">
              {systemAlert.type === "confirm"
                ? "Confirmación"
                : systemAlert.type === "success"
                  ? "¡Éxito!"
                  : "Aviso"}
            </h3>
            <p className="modal-message">{systemAlert.message}</p>
            <div className="modal-actions">
              {systemAlert.type === "confirm" && (
                <button
                  className="btn-modal btn-cancel"
                  onClick={() => setSystemAlert({ isOpen: false })}
                >
                  Cancelar
                </button>
              )}
              <button
                className="btn-modal btn-accept"
                onClick={() => {
                  if (systemAlert.action) systemAlert.action();
                  else setSystemAlert({ isOpen: false });
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
         MODAL OSCURO ACTUALIZADO (PRO-PORTRAIT)
         ========================================= */}
      {isFormModalOpen && (
        <div className="dark-modal-overlay">
          <div className="dark-modal-content portrait-mode">
            {" "}
            {/* NUEVA CLASE PARA ALTURA */}
            {/* 2. IMAGEN DE FONDO AJUSTADA EN CSS */}
            <img
              src={marcaAgua}
              alt="Fondo"
              className="dark-modal-bg-img-fixed"
            />
            <button
              className="dark-modal-close"
              onClick={() => setIsFormModalOpen(false)}
            >
              <FaTimes />
            </button>
            <div className="dark-modal-header">
              <FaBell className="dark-modal-icon" />
              <h2>{formData.id ? "Editar alerta" : "Crear alerta"}</h2>
            </div>
            <form className="dark-modal-form" onSubmit={handleSaveForm}>
              {/* Filas 1, 2 y 3 mantienen posición, solo cambia ubicación a SELECT */}
              <div className="form-row row-3-cols">
                <div className="dark-input-group">
                  <label>Título de la alerta</label>
                  <input
                    type="text"
                    name="titulo"
                    placeholder="Nombre de la alerta"
                    value={formData.titulo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="dark-input-group">
                  <label>Tipo de operación</label>
                  <div className="checkbox-row">
                    <label>
                      <input
                        type="checkbox"
                        name="compra"
                        checked={formData.compra}
                        onChange={handleInputChange}
                      />{" "}
                      Compra
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="alquiler"
                        checked={formData.alquiler}
                        onChange={handleInputChange}
                      />{" "}
                      Alquiler
                    </label>
                  </div>
                </div>
                <div className="dark-input-group">
                  <label>Habitaciones</label>
                  <select
                    name="habitaciones"
                    value={formData.habitaciones}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar monto</option>
                    {[1, 2, 3, 4, "5+"].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row row-3-cols">
                <div className="dark-input-group">
                  <label>Precio</label>
                  <div className="double-input">
                    <input
                      type="number"
                      name="precioMin"
                      placeholder="Monto mínimo"
                      value={formData.precioMin}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="precioMax"
                      placeholder="Monto máximo"
                      value={formData.precioMax}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="dark-input-group">
                  <label>Baños</label>
                  <select
                    name="banos"
                    value={formData.banos}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar monto</option>
                    {[1, 2, 3, "4+"].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dark-input-group">
                  <label>Superficie</label>
                  <div className="double-input">
                    <input
                      type="number"
                      name="superficieMin"
                      placeholder="Mínimo"
                      value={formData.superficieMin}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="superficieMax"
                      placeholder="Máximo"
                      value={formData.superficieMax}
                      onChange={handleInputChange}
                    />
                  </div>
                  <label className="sub-checkbox">
                    <input
                      type="checkbox"
                      name="conFotografias"
                      checked={formData.conFotografias}
                      onChange={handleInputChange}
                    />{" "}
                    Con fotografías
                  </label>
                </div>
              </div>

              <div className="form-row row-2-cols">
                <div className="dark-input-group">
                  <label>Ubicación</label>
                  {/* MODIFICADO: AHORA ES UN SELECT PARA "SELECCIONAR" */}
                  <select
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar ubicación</option>
                    {locationsOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MODIFICADO TOTALMENTE: PROPUESTA FUNCIONAL DE TAGS */}
                <div className="dark-input-group property-tags-group">
                  <div className="label-with-action">
                    <label>Tipo de inmueble</label>
                    {/* Acción para mostrar/ocultar el selector */}
                    <span
                      className="add-action"
                      onClick={() => setShowTypeSelector(!showTypeSelector)}
                    >
                      {showTypeSelector ? "- Cancelar" : "+ Añadir tipo"}
                    </span>
                  </div>

                  {/* Contenedor estilo "línea inferior" que alberga los tags */}
                  <div className="tags-underline-container">
                    {formData.tipoInmuebleTags.length === 0 && (
                      <span className="placeholder-text">
                        Ej. Departamento, Casa...
                      </span>
                    )}
                    {formData.tipoInmuebleTags.map((tag) => (
                      <span key={tag} className="property-tag">
                        {tag}{" "}
                        <FaTimes
                          className="remove-tag"
                          onClick={() => removePropertyTypeTag(tag)}
                        />
                      </span>
                    ))}

                    {/* Selector rápido absoluto que aparece al pulsar "+ Añadir tipo" */}
                    {showTypeSelector && (
                      <div className="quick-type-selector">
                        {propertyTypesOptions.map((option) => (
                          <div
                            key={option}
                            className="quick-option"
                            onClick={() => addPropertyTypeTag(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fila 4 (Footer) */}
              <div className="dark-form-footer pushed-down">
                {" "}
                {/* CLASE PARA BAJAR EL BOTÓN */}
                <label className="main-checkbox">
                  <input
                    type="checkbox"
                    name="enviarNuevos"
                    checked={formData.enviarNuevos}
                    onChange={handleInputChange}
                  />
                  Enviarme alertas cuando se publique nuevos inmuebles
                </label>
                <button type="submit" className="btn-dark-submit">
                  {formData.id ? "Guardar cambios" : "Crear alerta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PANEL PRINCIPAL --- */}
      <div className="alerts-header">
        <div className="alerts-title-area">
          <FaBell className="alerts-icon" />
          <h1 className="alerts-title">Mis alertas</h1>
        </div>
        <button className="btn-create-alert" onClick={openNewAlertModal}>
          Crear alerta
        </button>
      </div>

      <div className="alerts-content">
        {alertsList.length === 0 ? (
          <p className="no-alerts-text">No existen alertas</p>
        ) : (
          <div className="alerts-grid">
            {alertsList.map((alert) => (
              <div key={alert.id} className="alert-card">
                <div className="alert-card-header">
                  <h3>{alert.titulo}</h3>
                  <div className="alert-card-actions">
                    <button
                      className="btn-icon-action edit"
                      onClick={() => openEditAlertModal(alert)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon-action delete"
                      onClick={() => handleDeleteClick(alert.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
                <div className="alert-card-body">
                  <p>
                    <strong>Ubicación:</strong>{" "}
                    {alert.ubicacion || "Cualquiera"}
                  </p>
                  <p>
                    <strong>Operación:</strong>{" "}
                    {[alert.compra && "Compra", alert.alquiler && "Alquiler"]
                      .filter(Boolean)
                      .join(" / ") || "Cualquiera"}
                  </p>
                  <p>
                    <strong>Tipos:</strong>{" "}
                    {alert.tipoInmuebleTags.join(", ") || "Cualquiera"}
                  </p>
                  <p>
                    <strong>Precio:</strong> {alert.precioMin || "0"} -{" "}
                    {alert.precioMax || "Sin límite"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAlerts;
