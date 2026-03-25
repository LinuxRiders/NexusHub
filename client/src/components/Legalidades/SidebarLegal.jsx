import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaShieldAlt,
  FaFileContract,
  FaCookieBite,
} from "react-icons/fa";

import "./SidebarLegal.css";

const SidebarLegal = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuOptions = [
    {
      id: "faq",
      label: "Preguntas Frecuentes",
      icon: <FaQuestionCircle />,
    },
    {
      id: "privacidad",
      label: "Política de Privacidad",
      icon: <FaShieldAlt />,
    },
    {
      id: "terminos",
      label: "Términos y Condiciones",
      icon: <FaFileContract />,
    },
    {
      id: "cook",
      label: "Política de Cookies",
      icon: <FaCookieBite />,
    },
  ];

  const handleMenuClick = (id) => {
    setActiveTab(id);
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
