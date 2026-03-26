// src/components/Admin/AdminSidebarMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import "./AdminSidebarMenu.css";

const AdminSidebarMenu = ({ menuOptions, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Nuevo estado para controlar si el menú está abierto en móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuClick = async (id) => {
    if (id === "salir") {
      await logout();
      navigate("/");
    } else {
      setActiveTab(id);
      setIsMobileMenuOpen(false); // Cierra el menú al elegir una opción en móvil
    }
  };

  // Buscamos el nombre de la pestaña activa para mostrarlo en el botón del móvil
  const activeOption = menuOptions.find((opt) => opt.id === activeTab);

  return (
    <div className="admin-sidebar-menu-container">
      {/* BOTÓN MÓVIL (Oculto en PC) */}
      <button
        className="admin-mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span>{activeOption ? activeOption.label : "Menú"}</span>
        {isMobileMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* LISTA DE OPCIONES (En móvil se oculta/muestra con la clase 'open') */}
      <ul className={`admin-sidebar-list ${isMobileMenuOpen ? "open" : ""}`}>
        {menuOptions.map((option) => (
          <li
            key={option.id}
            className={`admin-sidebar-item ${activeTab === option.id ? "active" : ""}`}
            onClick={() => handleMenuClick(option.id)}
          >
            <span className="admin-sidebar-icon">{option.icon}</span>

            <span className="admin-sidebar-text">{option.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebarMenu;
