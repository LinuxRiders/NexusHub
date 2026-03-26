// src/components/Admin/AdminSidebarMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import {
  FaChevronDown,
  FaChevronUp,
  FaChartPie,
  FaBuilding,
  FaUsers,
  FaHeart,
  FaEnvelope,
  FaBell,
  FaSignOutAlt,
  FaQuestionCircle,
} from "react-icons/fa";

import "./AdminSidebarMenu.css";

const AdminSidebarMenu = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Nuevo estado para controlar si el menú está abierto en móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuOptions = [
    { id: "dashboard", label: "Dashboard", icon: <FaChartPie size={22} /> },
    {
      id: "inmuebles",
      label: "Gestión de Inmuebles",
      icon: <FaBuilding size={22} />,
    },
    {
      id: "usuarios",
      label: "Gestión de Usuarios",
      icon: <FaUsers size={22} />,
    },
    { id: "favoritos", label: "Favoritos", icon: <FaHeart size={22} /> },
    { id: "mensajes", label: "Mensajes", icon: <FaEnvelope size={22} /> },
    { id: "alertas", label: "Alertas", icon: <FaBell size={22} /> },
    { id: "faq", label: "FAQ", icon: <FaQuestionCircle size={22} /> },
    { id: "salir", label: "Salir", icon: <FaSignOutAlt size={22} /> },
  ];

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
