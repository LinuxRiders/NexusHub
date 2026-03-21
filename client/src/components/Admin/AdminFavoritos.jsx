// src/components/Admin/AdminFavoritos/AdminFavoritos.jsx
import React, { useState } from "react";
import {
  FaHeart,
  FaFire,
  FaTrophy,
  FaChartBar,
  FaBullhorn,
  FaFilter,
  FaSortAmountDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
} from "react-icons/fa";
import "./AdminFavoritos.css";

// Mock de datos para el análisis de mercado
const initialRankedProperties = [
  {
    id: 1,
    avenue: "Residencial El Golf",
    cityCountry: "Trujillo, Perú",
    price: "S/ 520,000",
    type: "COMPRA",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/55/99/1d/casa.jpg?w=1200&h=-1&s=1",
    favoritesCount: 145, // Muy popular
  },
  {
    id: 2,
    avenue: "Dpto. Av. Fátima",
    cityCountry: "Trujillo, Perú",
    price: "S/ 2,500 /mes",
    type: "ALQUILER",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/55/99/1d/casa.jpg?w=1200&h=-1&s=1",
    favoritesCount: 89,
  },
  {
    id: 3,
    avenue: "Casa de Campo Huanchaco",
    cityCountry: "Trujillo, Perú",
    price: "S/ 850,000",
    type: "COMPRA",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/55/99/1d/casa.jpg?w=1200&h=-1&s=1",
    favoritesCount: 34,
  },
  {
    id: 4,
    avenue: "Oficina Centro Histórico",
    cityCountry: "Trujillo, Perú",
    price: "S/ 1,200 /mes",
    type: "ALQUILER",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/55/99/1d/casa.jpg?w=1200&h=-1&s=1",
    favoritesCount: 12, // Poco popular
  },
];

const AdminFavoritos = () => {
  const [properties] = useState(initialRankedProperties);

  // Estados para filtros
  const [filterType, setFilterType] = useState("TODOS");
  const [sortOrder, setSortOrder] = useState("DESC"); // DESC = Mayor a menor

  // Configuración de Modales
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
    targetProperty: null,
  });

  const [promoMessage, setPromoMessage] = useState("");

  // ==========================================
  // LÓGICA DE ESTADÍSTICAS Y FILTROS
  // ==========================================
  const totalFavorites = properties.reduce(
    (acc, curr) => acc + curr.favoritesCount,
    0,
  );
  const maxFavorites = Math.max(...properties.map((p) => p.favoritesCount));

  // Encontrar la propiedad top (la más deseada)
  const topProperty = properties.reduce((prev, current) =>
    prev.favoritesCount > current.favoritesCount ? prev : current,
  );

  // Filtrar y ordenar
  let displayData = properties.filter(
    (p) => filterType === "TODOS" || p.type === filterType,
  );

  displayData.sort((a, b) => {
    if (sortOrder === "DESC") return b.favoritesCount - a.favoritesCount;
    return a.favoritesCount - b.favoritesCount;
  });

  // ==========================================
  // ACCIONES DE MODALES (MARKETING)
  // ==========================================
  const handlePromoteClick = (property) => {
    setPromoMessage("");
    setModalConfig({
      isOpen: true,
      type: "promote",
      targetProperty: property,
      message: `Enviarás una notificación a los ${property.favoritesCount} usuarios que marcaron "${property.avenue}" como favorito.`,
    });
  };

  const confirmPromotion = () => {
    if (!promoMessage.trim()) return; // Validación simple

    // Simulamos el envío
    setModalConfig({
      isOpen: true,
      type: "success",
      message: `¡Campaña enviada! ${modalConfig.targetProperty.favoritesCount} usuarios han sido notificados exitosamente.`,
      targetProperty: null,
    });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <div className="af-container">
      {/* MODAL DEL SISTEMA */}
      {modalConfig.isOpen && (
        <div className="af-modal-overlay">
          <div className="af-modal-box">
            <div className="af-modal-icon-wrapper">
              {modalConfig.type === "promote" ? (
                <FaBullhorn
                  className="af-modal-icon confirm-icon"
                  style={{ color: "#f59e0b" }}
                />
              ) : (
                <FaCheckCircle className="af-modal-icon success-icon" />
              )}
            </div>

            <h3 className="af-modal-title">
              {modalConfig.type === "promote" ? "Lanzar Promoción" : "¡Éxito!"}
            </h3>
            <p className="af-modal-message">{modalConfig.message}</p>

            {/* Input extra si es modo promoción */}
            {modalConfig.type === "promote" && (
              <div className="af-modal-form">
                <label>
                  Mensaje de la notificación (Ej. ¡Ha bajado de precio!)
                </label>
                <textarea
                  className="af-modal-textarea"
                  rows="3"
                  placeholder="Escribe el mensaje atractivo aquí..."
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                ></textarea>
                {!promoMessage.trim() && (
                  <span className="af-error-text">
                    El mensaje es obligatorio.
                  </span>
                )}
              </div>
            )}

            <div className="af-modal-actions">
              {modalConfig.type === "promote" && (
                <button className="af-btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
              )}
              <button
                className={`af-btn-accept ${modalConfig.type === "promote" && !promoMessage.trim() ? "disabled" : ""}`}
                disabled={
                  modalConfig.type === "promote" && !promoMessage.trim()
                }
                onClick={
                  modalConfig.type === "promote" ? confirmPromotion : closeModal
                }
              >
                {modalConfig.type === "promote" ? (
                  <>
                    <FaPaperPlane style={{ marginRight: "8px" }} /> Enviar a
                    todos
                  </>
                ) : (
                  "Aceptar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="af-header">
        <div className="af-title-group">
          <h1 className="af-title">Favoritos Globales</h1>
          <h2 className="af-subtitle">
            Análisis de mercado e interés de los usuarios
          </h2>
        </div>
      </div>

      {/* DASHBOARD DE INTELIGENCIA */}
      <div className="af-stats-bar">
        <div className="af-stat-item">
          <span className="af-stat-label">Total de "Me Gusta"</span>
          <div className="af-stat-value-group">
            <FaHeart className="af-text-red" />
            <span className="af-stat-value">{totalFavorites}</span>
          </div>
        </div>

        <div className="af-stat-item af-stat-featured">
          <span className="af-stat-label">Inmueble más deseado</span>
          <div className="af-stat-value-group">
            <FaTrophy className="af-text-gold" />
            <div className="af-stat-text-col">
              <span className="af-stat-value text-medium">
                {topProperty.avenue}
              </span>
              <span className="af-stat-subtext">
                {topProperty.favoritesCount} interesados
              </span>
            </div>
          </div>
        </div>

        <div className="af-stat-item">
          <span className="af-stat-label">Promedio de interés</span>
          <div className="af-stat-value-group">
            <FaChartBar className="af-text-corp" />
            <span className="af-stat-value">
              {Math.round(totalFavorites / properties.length)}{" "}
              <span style={{ fontSize: "14px", color: "#6b7280" }}>/ prop</span>
            </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR (FILTROS) */}
      <div className="af-toolbar">
        <div className="af-filter-box">
          <FaFilter className="af-toolbar-icon" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="af-select"
          >
            <option value="TODOS">Todas las operaciones</option>
            <option value="COMPRA">Solo Ventas</option>
            <option value="ALQUILER">Solo Alquileres</option>
          </select>
        </div>

        <div className="af-filter-box">
          <FaSortAmountDown className="af-toolbar-icon" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="af-select"
          >
            <option value="DESC">Mayor a Menor interés</option>
            <option value="ASC">Menor a Mayor interés</option>
          </select>
        </div>
      </div>

      {/* TABLA DE RANKING */}
      <div className="af-table-container">
        <table className="af-table">
          <thead>
            <tr>
              <th className="af-col-rank">Top</th>
              <th>Inmueble</th>
              <th className="af-hide-mobile">Operación / Precio</th>
              <th>Nivel de Interés</th>
              <th className="af-th-center">Marketing</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((prop, index) => {
                // Cálculo del ancho de la barra (porcentaje respecto al máximo)
                const barWidth = Math.round(
                  (prop.favoritesCount / maxFavorites) * 100,
                );
                // Determinar si es "Hot" (si tiene más del 70% del máximo)
                const isHot = barWidth > 70;

                return (
                  <tr key={prop.id}>
                    <td className="af-col-rank">
                      <div
                        className={`af-rank-circle ${index === 0 && sortOrder === "DESC" ? "rank-first" : ""}`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="af-td-flex">
                        <img
                          src={prop.imageUrl}
                          alt="inmueble"
                          className="af-td-img"
                        />
                        <div>
                          <strong>{prop.avenue}</strong>
                          <span className="af-text-muted">
                            {prop.cityCountry}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="af-hide-mobile">
                      <div className="af-td-col">
                        <span
                          className={`af-badge-type ${prop.type === "COMPRA" ? "af-badge-compra" : "af-badge-alquiler"}`}
                        >
                          {prop.type}
                        </span>
                        <strong className="af-price-text">{prop.price}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="af-interest-container">
                        <div className="af-interest-header">
                          <span className="af-interest-count">
                            <FaHeart className="af-small-heart" />{" "}
                            {prop.favoritesCount} usuarios
                          </span>
                          {isHot && (
                            <FaFire
                              className="af-hot-icon"
                              title="¡Inmueble muy deseado!"
                            />
                          )}
                        </div>
                        <div className="af-progress-bar">
                          <div
                            className={`af-progress-fill ${isHot ? "fill-hot" : "fill-normal"}`}
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="af-col-actions">
                      <button
                        className="af-btn-icon-action af-promote"
                        onClick={() => handlePromoteClick(prop)}
                        title="Enviar promoción a interesados"
                      >
                        <FaBullhorn />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="af-no-data">
                  No hay inmuebles que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFavoritos;
