import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import "./SidebarLegal.css";

const SidebarLegal = ({ menuOptions, activeTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (id) => {
    navigate(`/legalidades/${id}`);
    setIsMobileMenuOpen(false);
  };

  const activeOption = menuOptions.find((opt) => opt.id === activeTab);

  return (
    <div className="legal-sidebar-unique-container">
      {/* ESTE ES EL CONTENEDOR QUE TE PERSIGUE (STICKY) */}
      <div className="legal-sidebar-unique-sticky">
        {/* BOTÓN MÓVIL */}
        <button
          className="legal-mobile-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span>{activeOption ? activeOption.label : "Menú"}</span>
          {isMobileMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {/* LISTA DE OPCIONES */}
        <ul
          className={`legal-sidebar-unique-list ${isMobileMenuOpen ? "open" : ""}`}
        >
          {menuOptions.map((option) => (
            <li
              key={option.id}
              className={`legal-sidebar-unique-item ${activeTab === option.id ? "active" : ""}`}
              onClick={() => handleMenuClick(option.id)}
            >
              <span className="legal-sidebar-unique-icon">{option.icon}</span>
              <span className="legal-sidebar-unique-text">{option.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SidebarLegal;
