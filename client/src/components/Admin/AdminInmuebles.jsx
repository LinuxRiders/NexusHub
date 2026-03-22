// src/components/Admin/AdminInmuebles/AdminInmuebles.jsx
import React, { useState } from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaMapMarkerAlt,
  FaTags,
  FaRulerCombined,
  FaImage,
} from "react-icons/fa";
import "./AdminInmuebles.css";

const initialProperties = [
  {
    id: 1,
    avenue: "Av. España 123",
    cityCountry: "Trujillo, Perú",
    price: "S/ 350,000",
    numericPrice: 350000,
    rooms: 4,
    bathrooms: 2,
    levels: 2,
    mt2: 120,
    type: "COMPRA",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/55/99/1d/casa.jpg?w=1200&h=-1&s=1",
    isFavorite: false,
  },
  {
    id: 2,
    avenue: "Av. Fátima 456",
    cityCountry: "Trujillo, Perú",
    price: "S/ 420,000",
    numericPrice: 420000,
    rooms: 5,
    bathrooms: 3,
    levels: 2,
    mt2: 150,
    type: "COMPRA",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/55/99/1d/casa.jpg?w=1200&h=-1&s=1",
    isFavorite: true,
  },
  {
    id: 3,
    avenue: "Av. América Sur 789",
    cityCountry: "Trujillo, Perú",
    price: "S/ 2,500 /mes",
    numericPrice: 2500,
    rooms: 3,
    bathrooms: 2,
    levels: 1,
    mt2: 90,
    type: "ALQUILER",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/55/99/1d/casa.jpg?w=1200&h=-1&s=1",
    isFavorite: false,
  },
];

const AdminInmuebles = () => {
  const [properties, setProperties] = useState(initialProperties);
  const [view, setView] = useState("list");
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    avenue: "",
    cityCountry: "Trujillo, Perú", // Valor por defecto
    numericPrice: "",
    rooms: "",
    bathrooms: "",
    levels: "1",
    mt2: "",
    type: "COMPRA",
    imageUrl: "",
  });

  // Estado para validaciones de campos
  const [formErrors, setFormErrors] = useState({});

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetId: null,
  });

  // ==========================================
  // FORMATEO Y UTILIDADES
  // ==========================================

  // Convierte el número (ej. 350000) a texto (ej. "S/ 350,000") automáticamente
  const formatPriceString = (num, type) => {
    if (!num) return "";
    const formattedNum = new Intl.NumberFormat("es-PE").format(num);
    return type === "ALQUILER"
      ? `S/ ${formattedNum} /mes`
      : `S/ ${formattedNum}`;
  };

  // ==========================================
  // MANEJADORES DE VISTA Y FORMULARIO
  // ==========================================
  const handleAddNew = () => {
    setFormData({
      avenue: "",
      cityCountry: "Trujillo, Perú",
      numericPrice: "",
      rooms: "",
      bathrooms: "",
      levels: "1",
      mt2: "",
      type: "COMPRA",
      imageUrl: "",
    });
    setFormErrors({});
    setCurrentId(null);
    setView("form");
  };

  const handleEdit = (property) => {
    setFormData({ ...property });
    setFormErrors({});
    setCurrentId(property.id);
    setView("form");
  };

  const handleCancelForm = () => {
    setView("list");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiamos el error de este campo mientras el usuario escribe
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ==========================================
  // VALIDACIÓN DEL FORMULARIO
  // ==========================================
  const validateForm = () => {
    const errors = {};

    if (!formData.avenue.trim()) errors.avenue = "La dirección es obligatoria.";
    if (!formData.cityCountry.trim())
      errors.cityCountry = "La ciudad es obligatoria.";

    if (!formData.numericPrice || formData.numericPrice <= 0) {
      errors.numericPrice = "Ingresa un precio válido mayor a 0.";
    }

    if (formData.mt2 && formData.mt2 <= 0)
      errors.mt2 = "El área debe ser mayor a 0.";
    if (formData.rooms && formData.rooms < 0)
      errors.rooms = "No puede ser negativo.";
    if (formData.bathrooms && formData.bathrooms < 0)
      errors.bathrooms = "No puede ser negativo.";

    // Validación simple de URL si el usuario llenó el campo
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
    if (formData.imageUrl && !urlPattern.test(formData.imageUrl)) {
      errors.imageUrl = "Ingresa una URL de imagen válida (jpg, png, etc).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Retorna true si no hay errores
  };

  // ==========================================
  // ACCIONES CRUD (CON MODALES)
  // ==========================================
  const handleDeleteClick = (id) => {
    setModalConfig({
      isOpen: true,
      type: "confirm-delete",
      message:
        "¿Estás seguro de que deseas eliminar este inmueble de forma permanente?",
      targetId: id,
    });
  };

  const confirmDelete = () => {
    setProperties(properties.filter((p) => p.id !== modalConfig.targetId));
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "El inmueble ha sido eliminado correctamente.",
      targetId: null,
    });
  };

  const handleSaveClick = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message:
          "Por favor, corrige los campos marcados en rojo antes de guardar.",
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      type: "confirm-save",
      message: currentId
        ? "¿Guardar los cambios realizados en este inmueble?"
        : "¿Crear este nuevo inmueble en el sistema?",
    });
  };

  const confirmSave = () => {
    // Autogeneramos la versión string del precio para las tarjetas del usuario
    const generatedPriceString = formatPriceString(
      formData.numericPrice,
      formData.type,
    );

    const finalData = {
      ...formData,
      price: generatedPriceString,
      numericPrice: Number(formData.numericPrice),
      rooms: Number(formData.rooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      levels: Number(formData.levels) || 1,
      mt2: Number(formData.mt2) || 0,
    };

    if (currentId) {
      setProperties(
        properties.map((p) =>
          p.id === currentId
            ? { ...finalData, id: currentId, isFavorite: p.isFavorite }
            : p,
        ),
      );
    } else {
      const newId =
        properties.length > 0
          ? Math.max(...properties.map((p) => p.id)) + 1
          : 1;
      setProperties([
        ...properties,
        { ...finalData, id: newId, isFavorite: false },
      ]);
    }

    setView("list");
    setModalConfig({
      isOpen: true,
      type: "success",
      message: currentId
        ? "Inmueble actualizado con éxito."
        : "Nuevo inmueble registrado con éxito.",
    });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <div className="admin-crud-container">
      {/* MODAL GLOBAL */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type.includes("confirm") ? (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              ) : modalConfig.type === "error" ? (
                <FaExclamationTriangle
                  className="modal-icon error-icon"
                  style={{ color: "#dc2626" }}
                />
              ) : (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
            </div>
            <h3 className="modal-title">
              {modalConfig.type.includes("confirm")
                ? "Confirmar Acción"
                : modalConfig.type === "error"
                  ? "Aviso"
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
                    : modalConfig.type === "confirm-save"
                      ? confirmSave
                      : closeModal
                }
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA DE LISTA (TABLA) --- */}
      {view === "list" && (
        <div className="crud-list-view fade-in">
          <div className="crud-header">
            <div className="crud-title-group">
              <h1 className="crud-title">Gestión de Inmuebles</h1>
              <h2 className="crud-subtitle">
                Administra el catálogo de propiedades ({properties.length})
              </h2>
            </div>
            <button className="btn-action-primary" onClick={handleAddNew}>
              <FaPlus /> Nuevo Inmueble
            </button>
          </div>

          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Inmueble</th>
                  <th>Operación</th>
                  <th>Precio</th>
                  <th>Características</th>
                  <th className="th-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.length > 0 ? (
                  properties.map((prop) => (
                    <tr key={prop.id}>
                      <td className="col-id">#{prop.id}</td>
                      <td className="col-avenue">
                        <div className="td-flex">
                          {prop.imageUrl ? (
                            <img
                              src={prop.imageUrl}
                              alt="inmueble"
                              className="td-img"
                            />
                          ) : (
                            <div className="td-img-placeholder">
                              <FaImage />
                            </div>
                          )}
                          <div>
                            <strong>{prop.avenue}</strong>
                            <span>{prop.cityCountry}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge-type ${prop.type === "COMPRA" ? "badge-compra" : "badge-alquiler"}`}
                        >
                          {prop.type}
                        </span>
                      </td>
                      <td className="col-price">{prop.price}</td>
                      <td className="col-features">
                        <span>{prop.rooms} Habs</span> •{" "}
                        <span>{prop.bathrooms} Baños</span>
                      </td>

                      {/* CORRECCIÓN: Separando el td del flex de las acciones */}
                      <td className="th-center">
                        <div className="col-actions">
                          <button
                            className="btn-icon-action edit"
                            onClick={() => handleEdit(prop)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-icon-action delete"
                            onClick={() => handleDeleteClick(prop.id)}
                            title="Eliminar"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No hay inmuebles registrados actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- VISTA DE FORMULARIO (CREAR/EDITAR) --- */}
      {view === "form" && (
        <div className="crud-form-view fade-in">
          <div className="crud-header form-header">
            <button className="btn-back" onClick={handleCancelForm}>
              <FaArrowLeft /> Volver a la lista
            </button>
            <div className="crud-title-group mt-2">
              <h1 className="crud-title">
                {currentId ? "Editar Inmueble" : "Registrar Inmueble"}
              </h1>
              <h2 className="crud-subtitle">
                Completa la información detallada de la propiedad
              </h2>
            </div>
          </div>

          <form className="admin-form-container" onSubmit={handleSaveClick}>
            {/* SECCIÓN 1: Ubicación */}
            <div className="form-section">
              <h3 className="section-title">
                <FaMapMarkerAlt /> Ubicación
              </h3>
              <div className="admin-form-grid">
                <div
                  className={`admin-input-box ${formErrors.avenue ? "has-error" : ""}`}
                >
                  <label>Dirección exacta (Avenida/Calle) *</label>
                  <input
                    type="text"
                    name="avenue"
                    placeholder="Ej. Av. Fátima 123"
                    value={formData.avenue}
                    onChange={handleInputChange}
                  />
                  {formErrors.avenue && (
                    <span className="error-text">{formErrors.avenue}</span>
                  )}
                </div>
                <div
                  className={`admin-input-box ${formErrors.cityCountry ? "has-error" : ""}`}
                >
                  <label>Ciudad y País *</label>
                  <input
                    type="text"
                    name="cityCountry"
                    placeholder="Ej. Trujillo, Perú"
                    value={formData.cityCountry}
                    onChange={handleInputChange}
                  />
                  {formErrors.cityCountry && (
                    <span className="error-text">{formErrors.cityCountry}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Precios y Operación */}
            <div className="form-section">
              <h3 className="section-title">
                <FaTags /> Precio y Operación
              </h3>
              <div className="admin-form-grid">
                <div className="admin-input-box">
                  <label>Tipo de Operación *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    <option value="COMPRA">Venta / Compra</option>
                    <option value="ALQUILER">Alquiler</option>
                  </select>
                </div>

                {/* INPUT INTELIGENTE DE PRECIO */}
                <div
                  className={`admin-input-box ${formErrors.numericPrice ? "has-error" : ""}`}
                >
                  <label>Precio *</label>
                  <div className="input-with-prefix">
                    <span className="prefix">S/</span>
                    <input
                      type="number"
                      name="numericPrice"
                      placeholder="Ej. 350000"
                      value={formData.numericPrice}
                      onChange={handleInputChange}
                    />
                    {formData.type === "ALQUILER" && (
                      <span className="suffix">/mes</span>
                    )}
                  </div>
                  {formErrors.numericPrice ? (
                    <span className="error-text">
                      {formErrors.numericPrice}
                    </span>
                  ) : (
                    <span className="helper-text">
                      Solo ingresa números. El sistema lo formateará
                      automáticamente.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: Características */}
            <div className="form-section">
              <h3 className="section-title">
                <FaRulerCombined /> Características
              </h3>
              <div className="admin-form-grid columns-4">
                <div
                  className={`admin-input-box ${formErrors.rooms ? "has-error" : ""}`}
                >
                  <label>N° Habitaciones</label>
                  <input
                    type="number"
                    name="rooms"
                    min="0"
                    value={formData.rooms}
                    onChange={handleInputChange}
                  />
                  {formErrors.rooms && (
                    <span className="error-text">{formErrors.rooms}</span>
                  )}
                </div>
                <div
                  className={`admin-input-box ${formErrors.bathrooms ? "has-error" : ""}`}
                >
                  <label>N° Baños</label>
                  <input
                    type="number"
                    name="bathrooms"
                    min="0"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                  />
                  {formErrors.bathrooms && (
                    <span className="error-text">{formErrors.bathrooms}</span>
                  )}
                </div>
                <div className="admin-input-box">
                  <label>Niveles/Pisos</label>
                  <input
                    type="number"
                    name="levels"
                    min="1"
                    value={formData.levels}
                    onChange={handleInputChange}
                  />
                </div>
                <div
                  className={`admin-input-box ${formErrors.mt2 ? "has-error" : ""}`}
                >
                  <label>Área (m²)</label>
                  <div className="input-with-prefix">
                    <input
                      type="number"
                      name="mt2"
                      min="0"
                      value={formData.mt2}
                      onChange={handleInputChange}
                    />
                    <span className="suffix">m²</span>
                  </div>
                  {formErrors.mt2 && (
                    <span className="error-text">{formErrors.mt2}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: Multimedia */}
            <div className="form-section">
              <h3 className="section-title">
                <FaImage /> Multimedia
              </h3>
              <div className="admin-form-grid">
                <div
                  className={`admin-input-box full-width ${formErrors.imageUrl ? "has-error" : ""}`}
                >
                  <label>URL de la Imagen Principal</label>
                  <input
                    type="text"
                    name="imageUrl"
                    placeholder="Ej. https://miservidor.com/foto.jpg"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                  {formErrors.imageUrl && (
                    <span className="error-text">{formErrors.imageUrl}</span>
                  )}
                </div>
              </div>

              {/* Preview de la imagen si hay una URL válida */}
              {formData.imageUrl && !formErrors.imageUrl && (
                <div className="image-preview-container">
                  <p className="helper-text">Vista previa:</p>
                  <img
                    src={formData.imageUrl}
                    alt="Vista previa"
                    className="image-preview"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
            </div>

            {/* BOTONES */}
            <div className="admin-form-actions">
              <button
                type="button"
                className="btn-action-secondary"
                onClick={handleCancelForm}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-action-primary">
                <FaSave />{" "}
                {currentId ? "Actualizar Inmueble" : "Guardar Inmueble"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminInmuebles;
