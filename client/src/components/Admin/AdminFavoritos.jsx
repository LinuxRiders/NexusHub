// src/components/Admin/AdminFavoritos/AdminFavoritos.jsx
import React, { useState, useEffect } from "react";
import {
  FaHeart,
  FaFire,
  FaTrophy,
  FaChartBar,
  FaFilter,
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import api from "../../api/api";
import "./AdminFavoritos.css";

const AdminFavoritos = () => {
  const [properties, setProperties] = useState([]);

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Por defecto 10 inmuebles por página

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await api.get("/favorites/top");
        const rawData = res.data.data || [];

        // Parseamos las imágenes que vienen como string JSON
        const parsedData = rawData.map((prop) => {
          let images = prop.images;
          if (typeof images === "string") {
            try {
              images = JSON.parse(images);
            } catch (e) {
              console.error("Error parsing images for property:", prop.id, e);
              images = [];
            }
          }
          return {
            ...prop,
            images: Array.isArray(images) ? images : [],
          };
        });

        setProperties(parsedData);
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

  // Efecto de seguridad para la paginación al filtrar
  useEffect(() => {
    const maxPage = Math.ceil(displayData.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [displayData.length, itemsPerPage, currentPage]);

  // ==========================================
  // LÓGICA DE PAGINACIÓN MATEMÁTICA
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = displayData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reiniciar a la página 1 al cambiar filtros
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1); // Reiniciar a la página 1 al cambiar orden
  };

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
            onChange={handleFilterChange}
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
            onChange={handleSortChange}
            className="af-select"
          >
            <option value="DESC">Mayor a Menor interés</option>
            <option value="ASC">Menor a Mayor interés</option>
          </select>
        </div>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {displayData.length > 0 && (
        <div className="af-pagination-controls">
          <span className="af-count-info">
            Mostrando {indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, displayData.length)} de{" "}
            {displayData.length} resultados
          </span>
          <div className="af-filter-group">
            <label>Mostrar:</label>
            <select
              className="items-per-page-select"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5 resultados</option>
              <option value={10}>10 resultados</option>
              <option value={20}>20 resultados</option>
              <option value={50}>50 resultados</option>
            </select>
          </div>
        </div>
      )}

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
              currentData.map((prop, index) => {
                // Calcular el ranking real considerando la paginación
                const absoluteIndex = indexOfFirstItem + index;

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
                        className={`af-rank-circle ${absoluteIndex === 0 && sortOrder === "DESC" ? "rank-first" : ""}`}
                      >
                        {absoluteIndex + 1}
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
  );
};

export default AdminFavoritos;
