// src/components/Admin/AdminAlertas/AdminAlertas.jsx
import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaHome,
  FaTags,
  FaUser,
  FaChevronLeft, // Añadido para paginación
  FaChevronRight, // Añadido para paginación
} from "react-icons/fa";
import "./AdminAlertas.css";
import api from "../../api/api";

const AdminAlertas = () => {
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOperation, setFilterOperation] = useState("TODOS");
  const [filterType, setFilterType] = useState("TODOS");

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Por defecto 10 alertas por página

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts/admin/all");
      setAlerts(res.data.data);
    } catch (error) {
      console.error("Error fetching alerts", error);
    }
  };

  // ==========================================
  // ESTADÍSTICAS INTELIGENTES
  // ==========================================
  const totalAlerts = alerts.length;

  // Calcular operación más buscada
  const compras = alerts.filter((a) => a.is_buy).length;
  const alquileres = alerts.filter((a) => a.is_rent).length;
  const topOperation = compras >= alquileres ? "Compras" : "Alquileres";
  const topOpPercent =
    totalAlerts > 0
      ? Math.round((Math.max(compras, alquileres) / totalAlerts) * 100)
      : 0;

  // Calcular tipo de inmueble más buscado
  const typeCounts = alerts.reduce((acc, curr) => {
    if (curr.property_types && curr.property_types.length > 0) {
      curr.property_types.forEach((type) => {
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const topType =
    Object.keys(typeCounts).length > 0
      ? Object.keys(typeCounts).reduce((a, b) =>
          typeCounts[a] > typeCounts[b] ? a : b,
        )
      : "N/A";

  // ==========================================
  // FILTRADO Y BÚSQUEDA
  // ==========================================
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reiniciar paginación al buscar
  };

  const handleFilterOperationChange = (e) => {
    setFilterOperation(e.target.value);
    setCurrentPage(1); // Reiniciar paginación al filtrar
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reiniciar paginación al filtrar
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      (alert.user_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (alert.user_email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (alert.location || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOp =
      filterOperation === "TODOS" ||
      (filterOperation === "COMPRA" && alert.is_buy) ||
      (filterOperation === "ALQUILER" && alert.is_rent);

    const matchesType =
      filterType === "TODOS" ||
      (alert.property_types &&
        alert.property_types.some(
          (t) => t.toUpperCase() === filterType.toUpperCase(),
        ));

    return matchesSearch && matchesOp && matchesType;
  });

  // Efecto de seguridad para la paginación al filtrar
  useEffect(() => {
    const maxPage = Math.ceil(filteredAlerts.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [filteredAlerts.length, itemsPerPage, currentPage]);

  // ==========================================
  // LÓGICA DE PAGINACIÓN MATEMÁTICA
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Volver a la primera página al cambiar cantidad
  };

  return (
    <div className="aa-container">
      {/* HEADER DE LA VISTA */}
      <div className="aa-header">
        <div className="aa-title-group">
          <h1 className="aa-title">Alertas e Intenciones de Búsqueda</h1>
          <h2 className="aa-subtitle">
            Descubre qué propiedades están buscando los clientes en tiempo real
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
            <span className="aa-stat-value text-medium">
              {topType !== "N/A" ? `${topType}s` : topType}
            </span>
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
            onChange={handleSearchChange}
          />
        </div>
        <div className="aa-filter-bar">
          <FaFilter className="aa-search-icon" />
          <select
            value={filterOperation}
            onChange={handleFilterOperationChange}
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
            onChange={handleFilterTypeChange}
            className="aa-filter-select"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="DEPARTAMENTO">Departamentos</option>
            <option value="CASA">Casas</option>
            <option value="OFICINA">Oficinas</option>
            <option value="LOCAL COMERCIAL">Locales Comerciales</option>
            <option value="TERRENO">Terrenos</option>
            <option value="ALMACÉN">Almacenes</option>
          </select>
        </div>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {filteredAlerts.length > 0 && (
        <div className="aa-pagination-controls">
          <span className="aa-count-info">
            Mostrando {indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, filteredAlerts.length)} de{" "}
            {filteredAlerts.length} alertas
          </span>
          <div className="aa-filter-group">
            <label>Mostrar:</label>
            <select
              className="items-per-page-select"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={10}>10 alertas</option>
              <option value={20}>20 alertas</option>
              <option value={50}>50 alertas</option>
            </select>
          </div>
        </div>
      )}

      {/* TABLA DE ALERTAS */}
      <div className="aa-table-container">
        <table className="aa-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Intención de Búsqueda</th>
              <th className="aa-hide-mobile">Presupuesto Max.</th>
              <th className="aa-hide-mobile">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              currentAlerts.map((alert) => (
                <tr key={alert.id}>
                  {/* CLIENTE */}
                  <td>
                    <div className="aa-td-client">
                      <div className="aa-client-avatar">
                        <FaUser />
                      </div>
                      <div className="aa-client-info">
                        <strong>
                          {alert.user_name || "Usuario Desconocido"}
                        </strong>
                        <span>{alert.user_email || alert.user_phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* INTENCIÓN DE BÚSQUEDA */}
                  <td>
                    <div className="aa-td-intent">
                      <div className="aa-intent-tags">
                        <span
                          className={`aa-badge-op ${alert.is_buy ? "aa-badge-compra" : "aa-badge-alquiler"}`}
                        >
                          {alert.is_buy ? "COMPRA" : "ALQUILER"}
                        </span>
                        <span className="aa-badge-type">
                          {alert.property_types?.join(", ") || "Cualquiera"}
                        </span>
                      </div>
                      <div className="aa-intent-location">
                        <FaMapMarkerAlt className="aa-small-icon" />{" "}
                        {alert.location || "Cualquier zona"}
                      </div>
                    </div>
                  </td>

                  {/* PRESUPUESTO */}
                  <td className="aa-hide-mobile">
                    <span className="aa-price-text">
                      {alert.max_price ? `S/ ${alert.max_price}` : "Sin límite"}
                    </span>
                  </td>

                  {/* FECHA */}
                  <td className="aa-hide-mobile">
                    <span className="aa-date-text">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="aa-no-data">
                  No se encontraron alertas que coincidan con tu búsqueda.
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

export default AdminAlertas;
