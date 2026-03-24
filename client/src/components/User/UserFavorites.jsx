// src/components/User/UserFavorites/UserFavorites.jsx
import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle, // Mantenido por si lo usas en el futuro
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// IMAGEN IMPORTADA PARA REEMPLAZAR FaHeart
import favorito from "../../assets/img/icons/userCuenta/favorito.png";

import PropertyCard from "../Propiedades/PropertyCard";
import "./UserFavorites.css";
import api from "../../api/api";

const UserFavorites = () => {
  const [properties, setProperties] = useState([]);

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Por defecto 6 favoritos por página

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Efecto de seguridad: Si eliminamos favoritos y la página actual queda vacía, retrocedemos
  useEffect(() => {
    const maxPage = Math.ceil(properties.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [properties.length, itemsPerPage, currentPage]);

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get("/favorites/me");
      setProperties(data.data.map((fav) => ({ ...fav, isFavorite: true })));
    } catch (error) {
      console.error("Error fetching favorites", error);
    }
  };

  // ESTADO DE ALERTA (Copiado de tu UserPassword/UserAlerts)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "", // 'confirm', 'success'
    message: "",
    idToRemove: null,
  });

  // Al hacer clic en el corazón, disparamos la alerta de confirmación oficial
  const handleRemoveClick = (id) => {
    setModalConfig({
      isOpen: true,
      type: "confirm",
      message:
        "¿Estás seguro de que deseas eliminar este inmueble de tus favoritos?",
      idToRemove: id,
    });
  };

  // Función que se ejecuta al dar "Aceptar" en el modal de confirmación
  const confirmRemoval = async () => {
    try {
      await api.post(`/favorites/toggle/${modalConfig.idToRemove}`);
      setProperties((prev) =>
        prev.filter((p) => p.id !== modalConfig.idToRemove),
      );

      // Cambiamos a modal de éxito
      setModalConfig({
        ...modalConfig,
        type: "success",
        message: "Inmueble eliminado de tus favoritos correctamente.",
        idToRemove: null,
      });
    } catch (error) {
      console.error("Error removing favorite", error);
      setModalConfig({
        ...modalConfig,
        type: "error",
        message: "No se pudo eliminar de favoritos.",
        idToRemove: null,
      });
    }
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  // --- LÓGICA DE PAGINACIÓN MATEMÁTICA ---
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
    <div className="user-favorites-container">
      {/* --- MODAL DE SISTEMA (DISEÑO OFICIAL) --- */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type === "confirm" && (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              )}
              {modalConfig.type === "success" && (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
            </div>

            <h3 className="modal-title">
              {modalConfig.type === "confirm" ? "Confirmación" : "¡Éxito!"}
            </h3>

            <p className="modal-message">{modalConfig.message}</p>

            <div className="modal-actions">
              {modalConfig.type === "confirm" ? (
                <>
                  <button className="btn-modal btn-cancel" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    className="btn-modal btn-accept"
                    onClick={confirmRemoval}
                  >
                    Aceptar
                  </button>
                </>
              ) : (
                <button className="btn-modal btn-accept" onClick={closeModal}>
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CABECERA --- */}
      <div className="favorites-header">
        <img
          src={favorito}
          alt="Mis favoritos"
          className="favorites-title-icon-img"
        />
        <h1 className="favorites-title">Mis favoritos</h1>
      </div>

      {/* --- CONTENIDO --- */}
      {properties.length > 0 ? (
        <>
          {/* CONTROLES DE PAGINACIÓN SUPERIORES */}
          <div className="favorites-pagination-controls">
            <span className="favorites-count-info">
              Mostrando {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, properties.length)} de{" "}
              {properties.length} inmuebles
            </span>
            <div className="favorites-filter-group">
              <label>Mostrar:</label>
              <select
                className="items-per-page-select"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={6}>6 inmuebles</option>
                <option value={12}>12 inmuebles</option>
                <option value={24}>24 inmuebles</option>
              </select>
            </div>
          </div>

          {/* GRID DE PROPIEDADES */}
          <div className="properties-container">
            {currentProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onToggleFavorite={() => handleRemoveClick(property.id)}
                disableAos={true}
              />
            ))}
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
        </>
      ) : (
        <p className="no-favorites-text">No existen favoritos guardados.</p>
      )}
    </div>
  );
};

export default UserFavorites;
