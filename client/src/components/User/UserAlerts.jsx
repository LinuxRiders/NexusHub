// src/components/User/UserAlerts/UserAlerts.jsx
import React, { useState } from "react";
import {
  FaTimes,
  FaEdit,
  FaTrashAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

// IMÁGENES CORREGIDAS
import alerta from "../../assets/img/icons/userCuenta/alerta.png";
import marcaAgua from "../../assets/img/MarcaAgua.png";

import "./UserAlerts.css";
import api from "../../api/api";

// Lista de tipos de inmuebles disponibles para la propuesta funcional
const propertyTypesOptions = [
  "Departamento",
  "Casa",
  "Oficina",
  "Local Comercial",
  "Terreno",
  "Almacén",
];

const initialAlertState = {
  id: null,
  title: "",
  is_buy: false,
  is_rent: false,
  rooms: "",
  min_price: "",
  max_price: "",
  bathrooms: "",
  min_mt2: "",
  max_mt2: "",
  requires_photos: false,
  location: "",
  property_types: [],
  send_notifications: false, // Match backend schema
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

  const [locationsOptions, setLocationsOptions] = useState([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  React.useEffect(() => {
    fetchAlerts();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await api.get("/properties/locations");
      setLocationsOptions(res.data.data || []);
    } catch (error) {
      console.error("Error fetching locations", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts/me");
      setAlertsList(res.data.data);
    } catch (error) {
      console.error("Error fetching alerts", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addPropertyTypeTag = (type) => {
    if (type && !formData.property_types.includes(type)) {
      setFormData((prev) => ({
        ...prev,
        property_types: [...prev.property_types, type],
      }));
    }
    setShowTypeSelector(false);
  };

  const removePropertyTypeTag = (typeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      property_types: prev.property_types.filter(
        (type) => type !== typeToRemove,
      ),
    }));
  };

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
    if (!formData.title.trim()) {
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

  const confirmSaveAlert = async () => {
    try {
      let res;
      if (formData.id) {
        res = await api.put(`/alerts/${formData.id}`, formData);
      } else {
        res = await api.post("/alerts", formData);
      }

      await fetchAlerts();
      setIsFormModalOpen(false);

      setSystemAlert({
        isOpen: true,
        type: "success",
        message: "Alerta gestionada correctamente.",
      });
    } catch (error) {
      console.error("Error saving alert", error);
      setSystemAlert({
        isOpen: true,
        type: "error",
        message: "Ocurrió un error al gestionar la alerta.",
      });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("dark-modal-overlay")) {
      setIsFormModalOpen(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSystemAlert({
      isOpen: true,
      type: "confirm",
      message: "¿Eliminar esta alerta definitivamente?",
      action: () => confirmDeleteAlert(id),
    });
  };

  const confirmDeleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      await fetchAlerts();
      setSystemAlert({ isOpen: false });
    } catch (error) {
      console.error("Error deleting alert", error);
      setSystemAlert({
        isOpen: true,
        type: "error",
        message: "Ocurrió un error al eliminar la alerta.",
      });
    }
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
        <div className="dark-modal-overlay" onClick={handleOverlayClick}>
          <div className="dark-modal-content portrait-mode">
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
              <img src={alerta} alt="Alerta" className="dark-modal-icon-img" />
              <h2>{formData.id ? "Editar alerta" : "Crear alerta"}</h2>
            </div>

            <form className="dark-modal-form" onSubmit={handleSaveForm}>
              {/* FILA 1: Titulo, Ubicacion, Tipo de operación */}
              <div className="form-row row-3-cols">
                <div className="dark-input-group">
                  <label>Título de la alerta</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Nombre de la alerta"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="dark-input-group">
                  <label>Ubicación</label>
                  <select
                    name="location"
                    value={formData.location}
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
                <div className="dark-input-group">
                  <label>Tipo de operación</label>
                  <div
                    className="custom-checkbox-row"
                    style={{ paddingTop: "0" }}
                  >
                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.is_buy}
                            onChange={handleInputChange}
                            name="is_buy"
                            sx={{
                              color: "#666",
                              padding: "5px 9px",
                              "&.Mui-checked": { color: "#5ed6db" },
                            }}
                          />
                        }
                        label="Compra"
                        sx={{
                          color: "#fff",
                          marginRight: "25px",
                          "& .MuiFormControlLabel-label": {
                            fontSize: "14px",
                            fontWeight: "600",
                            fontFamily: '"Nunito", sans-serif',
                          },
                        }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.is_rent}
                            onChange={handleInputChange}
                            name="is_rent"
                            sx={{
                              color: "#666",
                              padding: "5px 9px",
                              "&.Mui-checked": { color: "#5ed6db" },
                            }}
                          />
                        }
                        label="Alquiler"
                        sx={{
                          color: "#fff",
                          "& .MuiFormControlLabel-label": {
                            fontSize: "14px",
                            fontWeight: "600",
                            fontFamily: '"Nunito", sans-serif',
                          },
                        }}
                      />
                    </FormGroup>
                  </div>
                </div>
              </div>

              {/* FILA 2: Distribución, Precio, Superficie */}
              <div className="form-row row-3-cols">
                <div className="dark-input-group">
                  <label>Distribución (Mínimo)</label>
                  <div className="double-input">
                    <div className="distrib-col">
                      <span className="mini-label">Habitaciones</span>
                      <select
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleInputChange}
                      >
                        <option value="">Cualquiera</option>
                        {[1, 2, 3, 4, "5+"].map((n) => (
                          <option key={n} value={n}>
                            {n} a más
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="distrib-col">
                      <span className="mini-label">Baños</span>
                      <select
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                      >
                        <option value="">Cualquiera</option>
                        {[1, 2, 3, "4+"].map((n) => (
                          <option key={n} value={n}>
                            {n} a más
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="dark-input-group">
                  <label>Precio</label>
                  <div className="double-input">
                    <div className="distrib-col">
                      <span className="mini-label">Mínimo</span>
                      <input
                        type="number"
                        name="min_price"
                        placeholder="Min"
                        value={formData.min_price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="distrib-col">
                      <span className="mini-label">Máximo</span>
                      <input
                        type="number"
                        name="max_price"
                        placeholder="Max"
                        value={formData.max_price}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="dark-input-group">
                  <label>Superficie (m&sup2;)</label>
                  <div className="double-input">
                    <div className="distrib-col">
                      <span className="mini-label">Mínimo</span>
                      <input
                        type="number"
                        name="min_mt2"
                        placeholder="Min"
                        value={formData.min_mt2}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="distrib-col">
                      <span className="mini-label">Máximo</span>
                      <input
                        type="number"
                        name="max_mt2"
                        placeholder="Max"
                        value={formData.max_mt2}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FILA 3: Tipo de Inmueble, Fotografías */}
              <div className="form-row row-tipo-inmueble">
                <div className="dark-input-group property-tags-group">
                  <div className="label-with-action">
                    <label>Tipo de inmueble</label>
                    <span
                      className="add-action emphasized-action"
                      onClick={() => setShowTypeSelector(!showTypeSelector)}
                    >
                      {showTypeSelector ? "- Cancelar" : "+ Añadir tipo"}
                    </span>
                  </div>

                  <div className="tags-underline-container">
                    {formData.property_types.length === 0 && (
                      <span className="placeholder-text">
                        Ej. Departamento, Casa...
                      </span>
                    )}
                    {formData.property_types.map((tag) => (
                      <span key={tag} className="property-tag">
                        {tag}{" "}
                        <FaTimes
                          className="remove-tag"
                          onClick={() => removePropertyTypeTag(tag)}
                        />
                      </span>
                    ))}

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

                <div className="dark-input-group">
                  <label>Filtro visual</label>
                  <label className="sub-checkbox highlight-checkbox">
                    <input
                      type="checkbox"
                      name="requires_photos"
                      checked={formData.requires_photos}
                      onChange={handleInputChange}
                    />{" "}
                    Solo publicaciones con fotografías
                  </label>
                </div>
              </div>

              <div className="dark-form-footer pushed-down">
                <label className="main-checkbox premium-checkbox">
                  <input
                    type="checkbox"
                    name="send_notifications"
                    checked={formData.send_notifications}
                    onChange={handleInputChange}
                  />
                  También enviarme notificaciones a mi correo electrónico
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
          {/* CAMBIADO A LA IMAGEN DE ALERTA */}
          <img
            src={alerta}
            alt="Mis Alertas"
            className="alerts-title-icon-img"
          />
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
              <div key={alert.id} className="alert-card pro-design">
                <div className="alert-card-header">
                  <h3>{alert.title}</h3>
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

                {/* DISEÑO PROFESIONAL PARA LOS DATOS DE LA ALERTA */}
                <div className="alert-card-body">
                  <div className="alert-detail-row">
                    <span className="alert-label">Ubicación</span>
                    <span className="alert-value">
                      {alert.location || "Cualquiera"}
                    </span>
                  </div>

                  <div className="alert-detail-row">
                    <span className="alert-label">Operación</span>
                    <span className="alert-value">
                      {[alert.is_buy && "Compra", alert.is_rent && "Alquiler"]
                        .filter(Boolean)
                        .map((op, i) => (
                          <span key={i} className="alert-badge highlight">
                            {op}
                          </span>
                        ))}
                      {!alert.is_buy && !alert.is_rent && "Cualquiera"}
                    </span>
                  </div>

                  <div className="alert-detail-row">
                    <span className="alert-label">Inmueble</span>
                    <span className="alert-value">
                      {alert.property_types && alert.property_types.length > 0
                        ? alert.property_types.map((tag) => (
                            <span key={tag} className="alert-badge">
                              {tag}
                            </span>
                          ))
                        : "Cualquiera"}
                    </span>
                  </div>

                  <div className="alert-detail-row">
                    <span className="alert-label">Precio</span>
                    <span className="alert-value price">
                      {alert.min_price || "0"} -{" "}
                      {alert.max_price || "Sin límite"}
                    </span>
                  </div>
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
