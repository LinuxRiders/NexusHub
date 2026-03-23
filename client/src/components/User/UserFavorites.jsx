// src/components/User/UserFavorites/UserFavorites.jsx
import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle, // Mantenido por si lo usas en el futuro
} from "react-icons/fa";

// IMAGEN IMPORTADA PARA REEMPLAZAR FaHeart
import favorito from "../../assets/img/icons/userCuenta/favorito.png";

import PropertyCard from "../Propiedades/PropertyCard";
import "./UserFavorites.css";
import api from "../../api/api";

const UserFavorites = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

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
        {/* REEMPLAZO DE FABELL POR LA IMAGEN */}
        <img
          src={favorito}
          alt="Mis favoritos"
          className="favorites-title-icon-img"
        />
        <h1 className="favorites-title">Mis favoritos</h1>
      </div>

      {/* --- GRID DE PROPIEDADES --- */}
      <div className="properties-container">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onToggleFavorite={() => handleRemoveClick(property.id)}
              disableAos={true}
            />
          ))
        ) : (
          <p className="no-favorites-text">No existen favoritos guardados.</p>
        )}
      </div>
    </div>
  );
};

export default UserFavorites;
