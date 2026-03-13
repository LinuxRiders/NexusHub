// src/components/Properties/PropertyCard.jsx
import React from "react";
import { MdOutlineBed, MdOutlineBathtub } from "react-icons/md";
import { BiHomeAlt, BiSquare } from "react-icons/bi";
// Importamos los estilos desde el archivo principal para mantener todo unificado
import "./PropertyCard.css";

const HeartIcon = ({ fillColor, strokeColor }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={fillColor}
    stroke={strokeColor}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const PropertyCard = ({ property, onToggleFavorite }) => {
  const {
    id,
    avenue,
    cityCountry,
    price,
    rooms,
    bathrooms,
    levels,
    mt2,
    type,
    imageUrl,
    isFavorite,
  } = property;

  const favoriteHeartColor = isFavorite ? "#1f6a6e" : "#FFFFFF";
  const favoriteCircleColor = isFavorite ? "#73a2a3" : "#808386";

  const iconColor = "#808386";
  const detailValueColor = "#1f6a6e";

  return (
    <div className="property-card">
      <div className="card-header">
        <img src={imageUrl} alt={`Vista de ${avenue}`} className="card-image" />
        <button
          className="favorite-button"
          onClick={() => onToggleFavorite(id)}
          style={{ backgroundColor: favoriteCircleColor }}
          aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <HeartIcon
            fillColor={favoriteHeartColor}
            strokeColor={favoriteHeartColor}
          />
        </button>
      </div>

      <div className="card-body">
        <h2 className="property-avenue">{avenue}</h2>
        <p className="property-location">{cityCountry}</p>
        <p className="property-price">{price}</p>
        <div className="divider" />

        <div className="details-grid">
          <div className="detail-item">
            <MdOutlineBed size={28} color={iconColor} />
            <div className="detail-text-group">
              <p className="detail-label">Habitaciones</p>
              <p className="detail-value" style={{ color: detailValueColor }}>
                {rooms}
              </p>
            </div>
          </div>
          <div className="detail-item">
            <MdOutlineBathtub size={26} color={iconColor} />
            <div className="detail-text-group">
              <p className="detail-label">Baños</p>
              <p className="detail-value" style={{ color: detailValueColor }}>
                {bathrooms}
              </p>
            </div>
          </div>
          <div className="detail-item">
            <BiHomeAlt size={26} color={iconColor} />
            <div className="detail-text-group">
              <p className="detail-label">Niveles</p>
              <p className="detail-value" style={{ color: detailValueColor }}>
                {levels}
              </p>
            </div>
          </div>
          <div className="detail-item">
            <BiSquare size={24} color={iconColor} />
            <div className="detail-text-group">
              <p className="detail-label">Mt2</p>
              <p className="detail-value" style={{ color: detailValueColor }}>
                {mt2}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button className="card-action-button">{type}</button>
    </div>
  );
};

export default PropertyCard;
