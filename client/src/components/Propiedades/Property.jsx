// src/components/Properties/Property.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import "./Property.css";
import api from "../../api/api";
import { useAuth } from "../../context/AuthProvider";

const Property = () => {
  const { isAuthenticated } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado para los filtros (iniciados desde la URL si existen)
  const [filters, setFilters] = useState({
    id: searchParams.get("id") || "",
    type: searchParams.get("type") || "TODOS",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rooms: searchParams.get("rooms") || "TODOS",
    bathrooms: searchParams.get("bathrooms") || "TODOS",
  });

  const fetchProperties = async () => {
    try {
      const { data } = await api.get("/properties");

      // El backend ahora devuelve un campo `isFavorite` (true/false) en cada propiedad
      // si es que el usuario incluyó su token (gracias a optionalAuthMiddleware).
      setProperties(data.data || []);
    } catch (error) {
      console.error("Error fetching properties", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [isAuthenticated]);

  // Lógica de filtrado
  useEffect(() => {
    let result = properties;

    if (filters.id) {
      result = result.filter((p) => String(p.id) === String(filters.id));
    } else {
      if (filters.type !== "TODOS") {
        result = result.filter((p) => p.operation_type === filters.type);
      }
      if (filters.minPrice !== "") {
        result = result.filter(
          (p) => Number(p.price) >= parseInt(filters.minPrice),
        );
      }
      if (filters.maxPrice !== "") {
        result = result.filter(
          (p) => Number(p.price) <= parseInt(filters.maxPrice),
        );
      }
      if (filters.rooms !== "TODOS") {
        result = result.filter((p) => p.rooms >= parseInt(filters.rooms));
      }
      if (filters.bathrooms !== "TODOS") {
        result = result.filter(
          (p) => p.bathrooms >= parseInt(filters.bathrooms),
        );
      }
    }

    setFilteredProperties(result);
  }, [filters, properties]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const nextFilters = { ...prev, [name]: value };

      // Actualizamos la URL descartando TODOS y vacios
      const query = {};
      for (const key in nextFilters) {
        if (nextFilters[key] && nextFilters[key] !== "TODOS") {
          query[key] = nextFilters[key];
        }
      }
      setSearchParams(query, { replace: true });
      return nextFilters;
    });
  };

  const toggleFavorite = async (id) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para añadir a favoritos.");
      return;
    }

    try {
      await api.post(`/favorites/toggle/${id}`);
      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.id === id
            ? { ...property, isFavorite: !property.isFavorite }
            : property,
        ),
      );
    } catch (error) {
      console.error("Error toggling favorite", error);
    }
  };

  return (
    <div className="properties-page">
      {/* Sección de Filtros */}
      <div className="filters-container" data-aos="fade-up">
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

      {filters.id && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            className="btn-action-primary"
            style={{ display: "inline-block" }}
            onClick={() => {
              const { id, ...rest } = filters;
              setFilters({ ...rest, id: "" });
              searchParams.delete("id");
              setSearchParams(searchParams);
            }}
          >
            Ver catálogo completo de propiedades
          </button>
        </div>
      )}

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
