// src/components/Admin/AdminAlertas/AdminAlertas.jsx
import React, { useState } from "react";
import {
  FaBell,
  FaSearch,
  FaFilter,
  FaTrashAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaHome,
  FaTags,
  FaUser,
} from "react-icons/fa";
import "./AdminAlertas.css";

// Mock de datos: Alertas creadas por los usuarios en la plataforma
const initialAlerts = [
  {
    id: 1,
    userName: "Sofía Nolasco",
    userEmail: "sofia.nolasco@gmail.com",
    operation: "COMPRA",
    propertyType: "Departamento",
    location: "Trujillo, Centro Histórico",
    maxPrice: "S/ 350,000",
    date: "Hace 2 horas",
    status: "ACTIVA",
  },
  {
    id: 2,
    userName: "Carlos Mendoza",
    userEmail: "carlos.m@hotmail.com",
    operation: "ALQUILER",
    propertyType: "Casa",
    location: "Víctor Larco, El Golf",
    maxPrice: "S/ 3,000 /mes",
    date: "Ayer",
    status: "ACTIVA",
  },
  {
    id: 3,
    userName: "Empresa Logistics SAC",
    userEmail: "gerencia@logistics.pe",
    operation: "ALQUILER",
    propertyType: "Oficina",
    location: "Huanchaco / Trujillo",
    maxPrice: "S/ 5,000 /mes",
    date: "Hace 3 días",
    status: "ACTIVA",
  },
  {
    id: 4,
    userName: "Miguel Ángel",
    userEmail: "miguel.ang@gmail.com",
    operation: "COMPRA",
    propertyType: "Terreno",
    location: "Moche",
    maxPrice: "S/ 120,000",
    date: "Hace 1 semana",
    status: "ACTIVA",
  },
];

const AdminAlertas = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOperation, setFilterOperation] = useState("TODOS");
  const [filterType, setFilterType] = useState("TODOS");

  // Configuración de Modales
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetAlert: null,
  });

  // Estado para el formulario de sugerencia (Match)
  const [suggestionData, setSuggestionData] = useState({
    propertyLink: "",
    note: "",
  });

  // ==========================================
  // ESTADÍSTICAS INTELIGENTES
  // ==========================================
  const totalAlerts = alerts.length;

  // Calcular operación más buscada
  const compras = alerts.filter((a) => a.operation === "COMPRA").length;
  const alquileres = alerts.filter((a) => a.operation === "ALQUILER").length;
  const topOperation = compras >= alquileres ? "Compras" : "Alquileres";
  const topOpPercent =
    totalAlerts > 0
      ? Math.round((Math.max(compras, alquileres) / totalAlerts) * 100)
      : 0;

  // Calcular tipo de inmueble más buscado
  const typeCounts = alerts.reduce((acc, curr) => {
    acc[curr.propertyType] = (acc[curr.propertyType] || 0) + 1;
    return acc;
  }, {});
  const topType =
    totalAlerts > 0
      ? Object.keys(typeCounts).reduce((a, b) =>
          typeCounts[a] > typeCounts[b] ? a : b,
        )
      : "N/A";

  // ==========================================
  // FILTRADO
  // ==========================================
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOp =
      filterOperation === "TODOS" || alert.operation === filterOperation;
    const matchesType =
      filterType === "TODOS" ||
      alert.propertyType.toUpperCase() === filterType.toUpperCase();
    return matchesSearch && matchesOp && matchesType;
  });

  // ==========================================
  // ACCIONES DE MODALES
  // ==========================================

  // Abrir modal para sugerir inmueble
  const handleSuggestClick = (alert) => {
    setSuggestionData({
      propertyLink: "",
      note: "¡Hola! Encontré una propiedad que coincide exactamente con lo que estás buscando.",
    });
    setModalConfig({
      isOpen: true,
      type: "suggest",
      targetAlert: alert,
      message: `Enviar sugerencia a ${alert.userName} (${alert.userEmail})`,
    });
  };

  const confirmSuggestion = () => {
    if (!suggestionData.propertyLink.trim()) return;

    // Simula envío de correo al cliente
    setModalConfig({
      isOpen: true,
      type: "success",
      message: `¡Sugerencia enviada con éxito a ${modalConfig.targetAlert.userName}!`,
      targetAlert: null,
    });
  };

  // Eliminar alerta (limpieza)
  const handleDeleteClick = (alert) => {
    setModalConfig({
      isOpen: true,
      type: "confirm-delete",
      message: "¿Estás seguro de que deseas eliminar esta alerta del sistema?",
      targetAlert: alert,
    });
  };

  const confirmDelete = () => {
    setAlerts(alerts.filter((a) => a.id !== modalConfig.targetAlert.id));
    setModalConfig({
      isOpen: true,
      type: "success",
      message: "Alerta eliminada correctamente.",
      targetAlert: null,
    });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <div className="aa-container">
      {/* MODAL GLOBAL MULTIUSO */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type === "confirm-delete" ? (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              ) : modalConfig.type === "suggest" ? (
                <FaPaperPlane
                  className="modal-icon confirm-icon"
                  style={{ color: "#1c6a6e" }}
                />
              ) : (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
            </div>

            <h3 className="modal-title">
              {modalConfig.type === "suggest"
                ? "Hacer Match con Cliente"
                : modalConfig.type === "confirm-delete"
                  ? "Confirmar Acción"
                  : "¡Éxito!"}
            </h3>
            <p className="modal-message">{modalConfig.message}</p>

            {/* Formulario específico para Sugerencias */}
            {modalConfig.type === "suggest" && (
              <div className="aa-modal-form">
                <div className="aa-alert-summary">
                  <strong>Busca:</strong> {modalConfig.targetAlert.propertyType}{" "}
                  en {modalConfig.targetAlert.location} (Max:{" "}
                  {modalConfig.targetAlert.maxPrice})
                </div>

                <label className="aa-modal-label">
                  Enlace o ID de la Propiedad sugerida *
                </label>
                <input
                  type="text"
                  placeholder="Ej. https://nexushub.com/propiedad/123"
                  value={suggestionData.propertyLink}
                  onChange={(e) =>
                    setSuggestionData({
                      ...suggestionData,
                      propertyLink: e.target.value,
                    })
                  }
                  className="aa-modal-input"
                />

                <label className="aa-modal-label">Nota adicional</label>
                <textarea
                  rows="3"
                  value={suggestionData.note}
                  onChange={(e) =>
                    setSuggestionData({
                      ...suggestionData,
                      note: e.target.value,
                    })
                  }
                  className="aa-modal-textarea"
                ></textarea>
              </div>
            )}

            <div className="modal-actions">
              {(modalConfig.type === "confirm-delete" ||
                modalConfig.type === "suggest") && (
                <button className="btn-modal btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
              )}
              <button
                className={`btn-modal btn-accept ${modalConfig.type === "suggest" && !suggestionData.propertyLink.trim() ? "disabled" : ""}`}
                disabled={
                  modalConfig.type === "suggest" &&
                  !suggestionData.propertyLink.trim()
                }
                onClick={
                  modalConfig.type === "confirm-delete"
                    ? confirmDelete
                    : modalConfig.type === "suggest"
                      ? confirmSuggestion
                      : closeModal
                }
              >
                {modalConfig.type === "suggest"
                  ? "Enviar Sugerencia"
                  : "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE LA VISTA */}
      <div className="aa-header">
        <div className="aa-title-group">
          <h1 className="aa-title">Alertas e Intenciones de Búsqueda</h1>
          <h2 className="aa-subtitle">
            Descubre qué propiedades están buscando tus clientes en tiempo real
          </h2>
        </div>
      </div>

      {/* DASHBOARD DE DEMANDA */}
      <div className="aa-stats-bar">
        <div className="aa-stat-item">
          <span className="aa-stat-label">Alertas Activas</span>
          <div className="aa-stat-value-group">
            <FaBell className="aa-text-corp" />
            <span className="aa-stat-value">{totalAlerts}</span>
          </div>
        </div>
        <div className="aa-stat-item">
          <span className="aa-stat-label">Mayor Demanda</span>
          <div className="aa-stat-value-group">
            <FaTags className="aa-text-green" />
            <div className="aa-stat-text-col">
              <span className="aa-stat-value text-medium">{topOperation}</span>
              <span className="aa-stat-subtext">
                {topOpPercent}% de las alertas
              </span>
            </div>
          </div>
        </div>
        <div className="aa-stat-item">
          <span className="aa-stat-label">Inmueble más buscado</span>
          <div className="aa-stat-value-group">
            <FaHome className="aa-text-orange" />
            <span className="aa-stat-value text-medium">{topType}s</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR (BÚSQUEDA Y FILTROS) */}
      <div className="aa-toolbar">
        <div className="aa-search-bar">
          <FaSearch className="aa-search-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="aa-filter-bar">
          <FaFilter className="aa-search-icon" />
          <select
            value={filterOperation}
            onChange={(e) => setFilterOperation(e.target.value)}
            className="aa-filter-select"
          >
            <option value="TODOS">Todas las Operaciones</option>
            <option value="COMPRA">Compras</option>
            <option value="ALQUILER">Alquileres</option>
          </select>
        </div>
        <div className="aa-filter-bar">
          <FaHome className="aa-search-icon" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="aa-filter-select"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="DEPARTAMENTO">Departamentos</option>
            <option value="CASA">Casas</option>
            <option value="OFICINA">Oficinas</option>
            <option value="TERRENO">Terrenos</option>
          </select>
        </div>
      </div>

      {/* TABLA DE ALERTAS */}
      <div className="aa-table-container">
        <table className="aa-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Intención de Búsqueda</th>
              <th className="aa-hide-mobile">Presupuesto Max.</th>
              <th className="aa-hide-mobile">Fecha</th>
              <th className="aa-th-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  {/* CLIENTE */}
                  <td>
                    <div className="aa-td-client">
                      <div className="aa-client-avatar">
                        <FaUser />
                      </div>
                      <div className="aa-client-info">
                        <strong>{alert.userName}</strong>
                        <span>{alert.userEmail}</span>
                      </div>
                    </div>
                  </td>

                  {/* INTENCIÓN DE BÚSQUEDA */}
                  <td>
                    <div className="aa-td-intent">
                      <div className="aa-intent-tags">
                        <span
                          className={`aa-badge-op ${alert.operation === "COMPRA" ? "aa-badge-compra" : "aa-badge-alquiler"}`}
                        >
                          {alert.operation}
                        </span>
                        <span className="aa-badge-type">
                          {alert.propertyType}
                        </span>
                      </div>
                      <div className="aa-intent-location">
                        <FaMapMarkerAlt className="aa-small-icon" />{" "}
                        {alert.location}
                      </div>
                    </div>
                  </td>

                  {/* PRESUPUESTO */}
                  <td className="aa-hide-mobile">
                    <span className="aa-price-text">{alert.maxPrice}</span>
                  </td>

                  {/* FECHA */}
                  <td className="aa-hide-mobile">
                    <span className="aa-date-text">{alert.date}</span>
                  </td>

                  {/* ACCIONES */}
                  <td className="aa-col-actions">
                    <button
                      className="aa-btn-icon aa-suggest"
                      onClick={() => handleSuggestClick(alert)}
                      title="Sugerir Inmueble (Match)"
                    >
                      <FaPaperPlane />
                    </button>
                    <button
                      className="aa-btn-icon aa-delete"
                      onClick={() => handleDeleteClick(alert)}
                      title="Eliminar Alerta"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="aa-no-data">
                  No se encontraron alertas que coincidan con tu búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAlertas;
