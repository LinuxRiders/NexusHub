import React, { useState, useEffect } from "react";
import { MdOutlineBed, MdOutlineBathtub } from "react-icons/md";
import { BiHomeAlt, BiSquare } from "react-icons/bi";
import {
  FaExpandArrowsAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
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

const PropertyCard = ({ property, onToggleFavorite, disableAos = false }) => {
  const {
    id,
    avenue,
    city_country,
    price,
    rooms,
    bathrooms,
    levels,
    mt2,
    operation_type,
    image_url,
    images,
    isFavorite,
  } = property;

  let parsedImages = [];
  if (Array.isArray(images)) {
    parsedImages = images;
  } else if (typeof images === "string") {
    try {
      parsedImages = JSON.parse(images);
      if (!Array.isArray(parsedImages)) parsedImages = [];
    } catch (e) {
      parsedImages = [];
    }
  }

  const displayImages =
    parsedImages.length > 0
      ? parsedImages
      : image_url
        ? [image_url]
        : ["https://via.placeholder.com/400x300?text=Sin+Imagen"];

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    let interval;
    if (displayImages.length > 1 && !isGalleryOpen) {
      interval = setInterval(() => {
        setCurrentImgIndex((prev) => (prev + 1) % displayImages.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [displayImages.length, isGalleryOpen]);

  // Gallery Handlers
  const handleNextPhoto = (e) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevPhoto = (e) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length,
    );
  };

  const formattedPrice =
    operation_type === "COMPRA"
      ? `S/ ${Number(price).toLocaleString()}`
      : `S/ ${Number(price).toLocaleString()} /mes`;

  const favoriteHeartColor = isFavorite ? "#1f6a6e" : "#FFFFFF";
  const favoriteCircleColor = isFavorite ? "#73a2a3" : "#808386";

  const iconColor = "#808386";
  const detailValueColor = "#1f6a6e";

  return (
    <>
      <div
        className="property-card"
        {...(!disableAos ? { "data-aos": "fade-up" } : {})}
      >
        <div className="card-header">
          <img
            src={displayImages[currentImgIndex]}
            alt={`Vista de ${avenue}`}
            className="card-image"
            style={{ transition: "opacity 0.5s ease-in-out" }}
          />

          {/* Boton abrir Galeria Arriba Izquierda */}
          <button
            className="gallery-button"
            onClick={() => setIsGalleryOpen(true)}
            aria-label="Abrir galería de fotos"
          >
            <FaExpandArrowsAlt size={16} color="#FFFFFF" />
          </button>

          {/* Boton Favoritos Arriba Derecha */}
          <button
            className="favorite-button"
            onClick={() => onToggleFavorite(id)}
            style={{ backgroundColor: favoriteCircleColor }}
            aria-label={
              isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"
            }
          >
            <HeartIcon
              fillColor={favoriteHeartColor}
              strokeColor={favoriteHeartColor}
            />
          </button>

          {/* Indicador de multiples imagenes */}
          {displayImages.length > 1 && (
            <div className="image-counter">
              {currentImgIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        <div className="card-body">
          <h2 className="property-avenue">{avenue}</h2>
          <p className="property-location">{city_country}</p>
          <p className="property-price">{formattedPrice}</p>
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

        <button className="card-action-button">{operation_type}</button>
      </div>

      {/* GALERÍA MODAL FULLSCREEN */}
      {isGalleryOpen && (
        <div
          className="gallery-modal-overlay"
          onClick={() => setIsGalleryOpen(false)}
        >
          <button
            className="gallery-close-btn"
            onClick={() => setIsGalleryOpen(false)}
          >
            <FaTimes size={24} />
          </button>

          <div
            className="gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="gallery-nav-btn left" onClick={handlePrevPhoto}>
              <FaChevronLeft size={32} />
            </button>

            <img
              src={displayImages[currentImgIndex]}
              alt="Vista Foto Grande"
              className="gallery-large-image"
            />

            <button className="gallery-nav-btn right" onClick={handleNextPhoto}>
              <FaChevronRight size={32} />
            </button>

            <div className="gallery-counter">
              {currentImgIndex + 1} / {displayImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;
