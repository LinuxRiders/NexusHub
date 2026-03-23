// src/components/Admin/AdminFavoritos/AdminFavoritos.jsx
import React, { useState, useEffect } from "react";
import {
  FaHeart,
  FaFire,
  FaTrophy,
  FaChartBar,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";
import api from "../../api/api";
import "./AdminFavoritos.css";

const AdminFavoritos = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await api.get("/favorites/top");
        setProperties(res.data.data || []);
      } catch (err) {
        console.error("Error fetching top favorites:", err);
      }
    };
    fetchTop();
  }, []);

  // Estados para filtros
  const [filterType, setFilterType] = useState("TODOS");
  const [sortOrder, setSortOrder] = useState("DESC"); // DESC = Mayor a menor

  // ==========================================
  // LÓGICA DE ESTADÍSTICAS Y FILTROS
  // ==========================================
  const totalFavorites = properties.reduce(
    (acc, curr) => acc + Number(curr.favoritesCount),
    0,
  );
  const maxFavorites =
    properties.length > 0
      ? Math.max(...properties.map((p) => Number(p.favoritesCount)))
      : 0;

  // Encontrar la propiedad top (la más deseada)
  const topProperty =
    properties.length > 0
      ? properties.reduce((prev, current) =>
          Number(prev.favoritesCount) > Number(current.favoritesCount)
            ? prev
            : current,
        )
      : null;

  // Filtrar y ordenar
  let displayData = properties.filter(
    (p) => filterType === "TODOS" || p.operation_type === filterType,
  );

  displayData.sort((a, b) => {
    if (sortOrder === "DESC")
      return Number(b.favoritesCount) - Number(a.favoritesCount);
    return Number(a.favoritesCount) - Number(b.favoritesCount);
  });

  return (
    <div className="af-container">
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
                {topProperty ? topProperty.avenue : "N/D"}
              </span>
              <span className="af-stat-subtext">
                {topProperty ? topProperty.favoritesCount : 0} interesados
              </span>
            </div>
          </div>
        </div>

        <div className="af-stat-item">
          <span className="af-stat-label">Promedio de interés</span>
          <div className="af-stat-value-group">
            <FaChartBar className="af-text-corp" />
            <span className="af-stat-value">
              {properties.length > 0
                ? Math.round(totalFavorites / properties.length)
                : 0}{" "}
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
                          src={
                            prop.images && prop.images.length > 0
                              ? prop.images[0]
                              : ""
                          }
                          alt="inmueble"
                          className="af-td-img"
                        />
                        <div>
                          <strong>{prop.avenue}</strong>
                          <span className="af-text-muted">
                            {prop.city_country}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="af-hide-mobile">
                      <div className="af-td-col">
                        <span
                          className={`af-badge-type ${prop.operation_type === "COMPRA" ? "af-badge-compra" : "af-badge-alquiler"}`}
                        >
                          {prop.operation_type}
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
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="af-no-data">
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
