// src/components/Admin/AdminInmuebles/AdminInmuebles.jsx
import React, { useState, useEffect } from "react";
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
  FaTimes,
  FaChevronLeft, // Añadido para paginación
  FaChevronRight, // Añadido para paginación
} from "react-icons/fa";
import { Autocomplete, TextField } from "@mui/material";
import "./AdminInmuebles.css";
import api from "../../api/api";

const AdminInmuebles = () => {
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [view, setView] = useState("list");
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    avenue: "",
    cityCountry: "Trujillo, Perú", // Valor por defecto
    property_type: "Departamento",
    operation_type: "COMPRA",
    numericPrice: "",
    rooms: "",
    bathrooms: "",
    levels: "1",
    mt2: "",
    imageUrl: "",
    status: "BORRADOR",
  });

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Por defecto 5 inmuebles por página

  useEffect(() => {
    fetchProperties();
    fetchLocations();
  }, []);

  // Efecto de seguridad para la paginación al eliminar elementos
  useEffect(() => {
    const maxPage = Math.ceil(properties.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [properties.length, itemsPerPage, currentPage]);

  const fetchLocations = async () => {
    try {
      const res = await api.get("/properties/locations");
      setLocations(res.data.data || []);
    } catch (error) {
      console.error("Error fetching locations", error);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties/admin/all");
      const propertiesData = res.data.data.map((prop) => {
        let parsedImages = [];
        if (Array.isArray(prop.images)) {
          parsedImages = prop.images;
        } else if (typeof prop.images === "string") {
          try {
            parsedImages = JSON.parse(prop.images);
          } catch (e) {
            console.error("Error parsing images for property:", prop.id);
          }
        }
        return { ...prop, images: parsedImages };
      });
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching properties", error);
    }
  };

  // Estado para validaciones de campos
  const [formErrors, setFormErrors] = useState({});
  const [tempImageUrl, setTempImageUrl] = useState("");

  const handleAddImage = () => {
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i;
    if (!tempImageUrl.trim()) return;
    if (!urlPattern.test(tempImageUrl.trim())) {
      setFormErrors((prev) => ({
        ...prev,
        imageUrl: "Ingresa una URL válida de imagen.",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), tempImageUrl.trim()],
    }));
    setTempImageUrl("");
    setFormErrors((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetId: null,
  });

  // ==========================================
  // FORMATEO Y UTILIDADES
  // ==========================================
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
      property_type: "Departamento",
      operation_type: "COMPRA",
      numericPrice: "",
      rooms: "",
      bathrooms: "",
      levels: "1",
      mt2: "",
      images: [],
      status: "BORRADOR",
    });
    setFormErrors({});
    setCurrentId(null);
    setView("form");
  };

  const handleEdit = (property) => {
    setFormData({
      avenue: property.avenue,
      cityCountry: property.city_country,
      property_type: property.property_type,
      operation_type: property.operation_type,
      numericPrice: property.price,
      rooms: property.rooms,
      bathrooms: property.bathrooms,
      levels: property.levels,
      mt2: property.mt2,
      images: property.images || [],
      status: property.status,
    });
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

  const confirmDelete = async () => {
    try {
      await api.delete(`/properties/${modalConfig.targetId}`);
      await fetchProperties();
      setModalConfig({
        isOpen: true,
        type: "success",
        message: "El inmueble ha sido eliminado correctamente.",
        targetId: null,
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Ocurrió un error al eliminar el inmueble.",
        targetId: null,
      });
    }
  };

  const handleStatusChange = async (propId, newStatus) => {
    try {
      await api.put(`/properties/${propId}`, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) => (p.id === propId ? { ...p, status: newStatus } : p)),
      );
      setModalConfig({
        isOpen: true,
        type: "success",
        message: "El estado del inmueble ha sido actualizado exitosamente.",
        targetId: null,
      });
    } catch (error) {
      console.error("Error updating status inline:", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "No se pudo actualizar el estado del inmueble.",
        targetId: null,
      });
    }
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

  const confirmSave = async () => {
    const finalData = {
      avenue: formData.avenue,
      city_country: formData.cityCountry,
      property_type: formData.property_type,
      operation_type: formData.operation_type,
      price: Number(formData.numericPrice),
      rooms: Number(formData.rooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      levels: Number(formData.levels) || 1,
      mt2: Number(formData.mt2) || 0,
      images: formData.images,
      status: formData.status,
    };

    try {
      if (currentId) {
        await api.put(`/properties/${currentId}`, finalData);
      } else {
        await api.post("/properties", finalData);
      }

      await fetchProperties();
      setView("list");
      setModalConfig({
        isOpen: true,
        type: "success",
        message: currentId
          ? "Inmueble actualizado con éxito."
          : "Nuevo inmueble registrado con éxito.",
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Error al guardar el inmueble.",
      });
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // ==========================================
  // LÓGICA DE PAGINACIÓN MATEMÁTICA
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = properties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(properties.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Hacemos scroll suave hacia arriba al cambiar de página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Volver a la primera página al cambiar cantidad
  };

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

          {/* CONTROLES DE PAGINACIÓN */}
          {properties.length > 0 && (
            <div className="admin-pagination-controls">
              <span className="admin-count-info">
                Mostrando {indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, properties.length)} de{" "}
                {properties.length} inmuebles
              </span>
              <div className="admin-filter-group">
                <label>Mostrar:</label>
                <select
                  className="items-per-page-select"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={5}>5 inmuebles</option>
                  <option value={10}>10 inmuebles</option>
                  <option value={20}>20 inmuebles</option>
                </select>
              </div>
            </div>
          )}

          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Inmueble</th>
                  <th>Operación</th>
                  <th>Precio</th>
                  <th>Características</th>
                  <th>Estado</th>
                  <th className="th-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.length > 0 ? (
                  currentProperties.map((prop) => (
                    <tr key={prop.id}>
                      <td className="col-id">#{prop.id}</td>
                      <td className="col-avenue">
                        <div className="td-flex">
                          {prop.images && prop.images.length > 0 ? (
                            <img
                              src={prop.images[0]}
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
                            <span>{prop.city_country}</span>
                            <span
                              style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#666",
                              }}
                            >
                              {prop.property_type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge-type ${prop.operation_type === "COMPRA" ? "badge-compra" : "badge-alquiler"}`}
                        >
                          {prop.operation_type}
                        </span>
                      </td>
                      <td className="col-price">S/ {prop.price}</td>
                      <td className="col-features">
                        <span>{prop.rooms} Habs</span> •{" "}
                        <span>{prop.bathrooms} Baños</span>
                      </td>
                      <td className="col-status">
                        <button
                          className={`modern-status-toggle ${prop.status === "PUBLICADO" ? "is-published" : "is-draft"}`}
                          onClick={() =>
                            handleStatusChange(
                              prop.id,
                              prop.status === "PUBLICADO"
                                ? "BORRADOR"
                                : "PUBLICADO",
                            )
                          }
                          title={`Click para cambiar a ${prop.status === "PUBLICADO" ? "BORRADOR" : "PUBLICADO"}`}
                        >
                          <div className="toggle-slider-circle"></div>
                          <span className="toggle-text">{prop.status}</span>
                        </button>
                      </td>
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
                    <td colSpan="7" className="no-data">
                      No hay inmuebles registrados actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* NAVEGACIÓN DE PÁGINAS INFERIOR */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <FaChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
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
                  <Autocomplete
                    freeSolo
                    options={locations}
                    value={formData.cityCountry}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        cityCountry: newValue || "",
                      }));
                      if (formErrors.cityCountry) {
                        setFormErrors((prev) => ({ ...prev, cityCountry: "" }));
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        cityCountry: newInputValue,
                      }));
                      if (formErrors.cityCountry) {
                        setFormErrors((prev) => ({ ...prev, cityCountry: "" }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Ej. Trujillo, Perú"
                        variant="outlined"
                        sx={{
                          backgroundColor: "#f9fafb",
                          "& .MuiOutlinedInput-root": {
                            padding: "0 9px",
                            height: "45px",
                            fontFamily: '"Nunito", sans-serif',
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#111827",
                            borderRadius: "6px",
                            "& fieldset": { borderColor: "#d1d5db" },
                            "&:hover fieldset": { borderColor: "#1c6a6e" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1c6a6e",
                              borderWidth: "2px",
                            },
                          },
                          "& input": {
                            border: "none !important",
                            backgroundColor: "transparent !important",
                            boxShadow: "none !important",
                            padding: "0 6px !important",
                            height: "100%",
                          },
                        }}
                      />
                    )}
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
                  <label>Tipo de Inmueble *</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    <option value="Departamento">Departamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Local Comercial">Local Comercial</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Almacén">Almacén</option>
                  </select>
                </div>
                <div className="admin-input-box">
                  <label>Tipo de Operación *</label>
                  <select
                    name="operation_type"
                    value={formData.operation_type}
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
                    {formData.operation_type === "ALQUILER" && (
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
                <FaImage /> Galería de Imágenes
              </h3>
              <div className="admin-form-grid">
                <div
                  className={`admin-input-box full-width ${formErrors.imageUrl ? "has-error" : ""}`}
                >
                  <label>Añadir Nueva URL de Imagen</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Ej. https://miservidor.com/foto.jpg"
                      value={tempImageUrl}
                      onChange={(e) => {
                        setTempImageUrl(e.target.value);
                        if (formErrors.imageUrl)
                          setFormErrors((prev) => ({ ...prev, imageUrl: "" }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      style={{
                        padding: "0 20px",
                        backgroundColor: "#1c6a6e",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontFamily: '"Nunito", sans-serif',
                      }}
                    >
                      Añadir a Galería
                    </button>
                  </div>
                  {formErrors.imageUrl && (
                    <span className="error-text">{formErrors.imageUrl}</span>
                  )}
                </div>
              </div>

              {/* Preview de la galería */}
              {formData.images && formData.images.length > 0 && (
                <div
                  className="image-preview-container"
                  style={{ marginTop: "20px" }}
                >
                  <p className="helper-text" style={{ marginBottom: "15px" }}>
                    Vista previa de la galería ({formData.images.length}):
                  </p>
                  <div
                    style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
                  >
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          width: "150px",
                          height: "150px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #ddd",
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Prev ${idx}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            backgroundColor: "rgba(255,0,0,0.8)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 5: Estado */}
            <div className="form-section">
              <h3 className="section-title">
                <FaCheckCircle /> Estado de Publicación
              </h3>
              <div className="admin-form-grid">
                <div className="admin-input-box">
                  <label>Estado *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    <option value="BORRADOR">
                      Borrador (No visible para usuarios)
                    </option>
                    <option value="PUBLICADO">
                      Publicado (Visible y envía alertas a interesados)
                    </option>
                  </select>
                </div>
              </div>
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
