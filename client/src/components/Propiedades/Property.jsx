// src/components/Properties/Property.jsx
import React, { useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import { propertiesData as initialData } from "./propertiesData";
import "./Property.css";

const Property = () => {
  const [properties, setProperties] = useState(initialData);
  const [filteredProperties, setFilteredProperties] = useState(initialData);

  // Estado para los filtros
  const [filters, setFilters] = useState({
    type: "TODOS",
    minPrice: "",
    maxPrice: "",
    rooms: "TODOS",
    bathrooms: "TODOS",
  });

  // Lógica de filtrado
  useEffect(() => {
    let result = properties;

    if (filters.type !== "TODOS") {
      result = result.filter((p) => p.type === filters.type);
    }
    if (filters.minPrice !== "") {
      result = result.filter(
        (p) => p.numericPrice >= parseInt(filters.minPrice),
      );
    }
    if (filters.maxPrice !== "") {
      result = result.filter(
        (p) => p.numericPrice <= parseInt(filters.maxPrice),
      );
    }
    if (filters.rooms !== "TODOS") {
      result = result.filter((p) => p.rooms >= parseInt(filters.rooms));
    }
    if (filters.bathrooms !== "TODOS") {
      result = result.filter((p) => p.bathrooms >= parseInt(filters.bathrooms));
    }

    setFilteredProperties(result);
  }, [filters, properties]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFavorite = (id) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        property.id === id
          ? { ...property, isFavorite: !property.isFavorite }
          : property,
      ),
    );
  };

  return (
    <div className="properties-page">
      {/* Sección de Filtros */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Operación</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="TODOS">Todos</option>
            <option value="COMPRA">Compra</option>
            <option value="ALQUILER">Alquiler</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Precio Min (S/)</label>
          <input
            type="number"
            name="minPrice"
            placeholder="Ej: 1000"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Precio Max (S/)</label>
          <input
            type="number"
            name="maxPrice"
            placeholder="Ej: 500000"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Habitaciones</label>
          <select
            name="rooms"
            value={filters.rooms}
            onChange={handleFilterChange}
          >
            <option value="TODOS">Cualquiera</option>
            <option value="2">2+ habs.</option>
            <option value="3">3+ habs.</option>
            <option value="4">4+ habs.</option>
            <option value="5">5+ habs.</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Baños</label>
          <select
            name="bathrooms"
            value={filters.bathrooms}
            onChange={handleFilterChange}
          >
            <option value="TODOS">Cualquiera</option>
            <option value="1">1+ baños</option>
            <option value="2">2+ baños</option>
            <option value="3">3+ baños</option>
          </select>
        </div>
      </div>

      {/* Contenedor de Tarjetas */}
      <div className="properties-container">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <p className="no-results">
            No se encontraron propiedades con esos filtros.
          </p>
        )}
      </div>
    </div>
  );
};

export default Property;
