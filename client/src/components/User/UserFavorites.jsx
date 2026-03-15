// src/components/User/UserFavorites/UserFavorites.jsx
import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle, // Mantenido por si lo usas en el futuro
} from "react-icons/fa";

// IMAGEN IMPORTADA PARA REEMPLAZAR FaHeart
import favorito from "../../assets/img/icons/userCuenta/favorito.png";

import PropertyCard from "../Propiedades/PropertyCard";
import { propertiesData as initialData } from "../Propiedades/propertiesData";
import "./UserFavorites.css";

const UserFavorites = () => {
  // Filtramos los datos iniciales para mostrar solo favoritos
  const [properties, setProperties] = useState(
    initialData.filter((p) => p.isFavorite === true),
  );

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
  const confirmRemoval = () => {
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
