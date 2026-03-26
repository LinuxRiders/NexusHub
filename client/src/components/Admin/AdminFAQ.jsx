import React, { useState } from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaArrowLeft,
  FaSave,
  FaQuestionCircle,
  FaAlignLeft,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

// Usamos react-quill-new compatible con React 19
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import "./AdminFAQ.css";

// La configuración debe ir afuera para evitar crasheos
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const AdminFAQ = () => {
  // Datos simulados
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "¿Cómo puedo alquilar una propiedad con Nexus Hub?",
      answer:
        "<p>Para alquilar un inmueble a través de nosotros, el <strong>primer paso</strong> es contactarnos y contarnos qué estás buscando...</p>",
    },
    {
      id: 2,
      question:
        "Soy propietario, ¿cómo me ayudan a vender o alquilar mi inmueble?",
      answer:
        "<p>Nexus Hub te ofrece un <strong>servicio integral</strong>. Esto incluye una <strong>tasación profesional</strong>...</p>",
    },
  ]);

  const [view, setView] = useState("list");
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  // ==========================================
  // ESTADO DEL MODAL (IDÉNTICO A ADMIN INMUEBLES)
  // ==========================================
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetId: null,
  });

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // --- MANEJO DEL FORMULARIO ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditorChange = (content) => {
    setFormData({ ...formData, answer: content });
  };

  const handleCreateNew = () => {
    setCurrentId(null);
    setFormData({ question: "", answer: "" });
    setView("form");
  };

  const handleEdit = (faq) => {
    setCurrentId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
    });
    setView("form");
  };

  // --- ACCIONES CRUD (CON MODALES) ---
  const handleDeleteClick = (id) => {
    setModalConfig({
      isOpen: true,
      type: "confirm-delete",
      message:
        "¿Estás seguro de que deseas eliminar esta pregunta frecuente de forma permanente?",
      targetId: id,
    });
  };

  const confirmDelete = () => {
    setFaqs(faqs.filter((faq) => faq.id !== modalConfig.targetId));
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "La pregunta ha sido eliminada correctamente.",
      targetId: null,
    });
  };

  const handleSaveClick = (e) => {
    e.preventDefault();

    // Validación básica antes de preguntar
    if (
      !formData.question ||
      !formData.answer ||
      formData.answer === "<p><br></p>"
    ) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message:
          "Por favor, completa la pregunta y la respuesta antes de guardar.",
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      type: "confirm-save",
      message: currentId
        ? "¿Guardar los cambios realizados en esta pregunta?"
        : "¿Crear esta nueva pregunta en el sistema?",
    });
  };

  const confirmSave = () => {
    if (currentId) {
      // Actualizar
      setFaqs(
        faqs.map((faq) =>
          faq.id === currentId ? { ...formData, id: currentId } : faq,
        ),
      );
    } else {
      // Crear nuevo
      const newFaq = { ...formData, id: Date.now() };
      setFaqs([...faqs, newFaq]);
    }
    setView("list");
    setModalConfig({
      isOpen: true,
      type: "success",
      message: currentId
        ? "Pregunta actualizada con éxito."
        : "Nueva pregunta registrada con éxito.",
    });
  };

  const handleCancelForm = () => {
    setView("list");
  };

  // Función para limpiar HTML para la vista previa en la tabla
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className="admin-crud-container fade-in">
      {/* ==========================================
          MODAL GLOBAL (IDÉNTICO A ADMIN INMUEBLES)
          ========================================== */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type.includes("confirm") ? (
                <FaExclamationTriangle
                  className="modal-icon confirm-icon"
                  style={{ color: "#f59e0b" }}
                />
              ) : modalConfig.type === "error" ? (
                <FaExclamationTriangle
                  className="modal-icon error-icon"
                  style={{ color: "#dc2626" }}
                />
              ) : (
                <FaCheckCircle
                  className="modal-icon success-icon"
                  style={{ color: "#10b981" }}
                />
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
                <button
                  type="button"
                  className="btn-modal btn-cancel"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
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

      {/* VISTA DE LISTA */}
      {view === "list" && (
        <div className="crud-list-view">
          <div className="crud-header">
            <div>
              <h2 style={{ color: "#1c6a6e", margin: 0 }}>
                Preguntas Frecuentes (FAQ)
              </h2>
              <p
                style={{ color: "#6b7280", fontSize: "14px", marginTop: "5px" }}
              >
                Gestiona las preguntas y respuestas de tu portal.
              </p>
            </div>
            <button className="btn-action-primary" onClick={handleCreateNew}>
              <FaPlus /> Añadir Pregunta
            </button>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "80%" }}>
                    Pregunta y Respuesta (Vista previa)
                  </th>
                  <th style={{ textAlign: "center", width: "20%" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id}>
                    <td className="table-preview-cell">
                      <div className="preview-question">{faq.question}</div>
                      <div className="preview-answer">
                        {stripHtml(faq.answer)}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(faq)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteClick(faq.id)}
                        title="Eliminar"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
                {faqs.length === 0 && (
                  <tr>
                    <td
                      colSpan="2"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      No hay preguntas frecuentes registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA DE FORMULARIO */}
      {view === "form" && (
        <div className="crud-form-view">
          <div className="crud-header form-header">
            <button className="btn-back" onClick={handleCancelForm}>
              <FaArrowLeft /> Volver al listado
            </button>
            <h2 className="mt-2" style={{ color: "#1c6a6e" }}>
              {currentId
                ? "Editar Pregunta Frecuente"
                : "Nueva Pregunta Frecuente"}
            </h2>
          </div>

          <form className="admin-form-container" onSubmit={handleSaveClick}>
            <div className="admin-form-section">
              <h3 className="section-title">
                <FaQuestionCircle /> Información de la Pregunta
              </h3>
              <div
                className="admin-form-grid"
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className="admin-input-box">
                  <label>Pregunta (Título) *</label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="Ej: ¿Cómo puedo alquilar una propiedad?"
                  />
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <h3 className="section-title">
                <FaAlignLeft /> Respuesta Detallada
              </h3>
              <div
                className="admin-form-grid"
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className="admin-input-box quill-editor-wrapper">
                  <label>Contenido de la respuesta *</label>
                  <ReactQuill
                    theme="snow"
                    value={formData.answer}
                    onChange={handleEditorChange}
                    modules={quillModules}
                    placeholder="Escribe y dale formato a la respuesta aquí..."
                  />
                </div>
              </div>
            </div>

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
                {currentId ? "Actualizar Pregunta" : "Guardar Pregunta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;
