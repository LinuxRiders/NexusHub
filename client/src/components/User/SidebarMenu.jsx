// src/components/User/SidebarMenu/SidebarMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Añadimos iconos para el botón móvil
import { useAuth } from "../../context/AuthProvider";

import user from "../../assets/img/icons/userCuenta/user.png";
import user2 from "../../assets/img/icons/userCuenta/user2.png";
import candado from "../../assets/img/icons/userCuenta/candado.png";
import candado2 from "../../assets/img/icons/userCuenta/candado2.png";
import favorito from "../../assets/img/icons/userCuenta/favorito.png";
import favorito2 from "../../assets/img/icons/userCuenta/favorito2.png";
import eliminar from "../../assets/img/icons/userCuenta/eliminar.png";
import eliminar2 from "../../assets/img/icons/userCuenta/eliminar2.png";
import alerta from "../../assets/img/icons/userCuenta/alerta.png";
import alerta2 from "../../assets/img/icons/userCuenta/alerta2.png";
import salir from "../../assets/img/icons/userCuenta/salir.png";
import salir2 from "../../assets/img/icons/userCuenta/salir2.png";

import "./SidebarMenu.css";

const SidebarMenu = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Nuevo estado para controlar si el menú está abierto en móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuOptions = [
    { id: "datos", label: "Datos del usuario", icon: user, iconHover: user2 },
    {
      id: "contraseña",
      label: "Cambiar contraseña",
      icon: candado,
      iconHover: candado2,
    },
    { id: "alertas", label: "Mis alertas", icon: alerta, iconHover: alerta2 },
    {
      id: "favoritos",
      label: "Mis favoritos",
      icon: favorito,
      iconHover: favorito2,
    },
    {
      id: "baja",
      label: "Darme de baja",
      icon: eliminar,
      iconHover: eliminar2,
    },
    { id: "salir", label: "Salir", icon: salir, iconHover: salir2 },
  ];

  const handleMenuClick = async (id) => {
    if (id === "salir") {
      try {
        await logout();
      } catch (error) {
        console.error("Error al cerrar sesión", error);
      }
    } else {
      setActiveTab(id);
      setIsMobileMenuOpen(false); // Cierra el menú al elegir una opción en móvil
    }
  };

  // Buscamos el nombre de la pestaña activa para mostrarlo en el botón del móvil
  const activeOption = menuOptions.find((opt) => opt.id === activeTab);

  return (
    <div className="sidebar-menu-container">
      {/* BOTÓN MÓVIL (Oculto en PC) */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span>{activeOption ? activeOption.label : "Menú"}</span>
        {isMobileMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* LISTA DE OPCIONES (En móvil se oculta/muestra con la clase 'open') */}
      <ul className={`sidebar-list ${isMobileMenuOpen ? "open" : ""}`}>
        {menuOptions.map((option) => (
          <li
            key={option.id}
            className={`sidebar-item ${activeTab === option.id ? "active" : ""}`}
            onClick={() => handleMenuClick(option.id)}
          >
            <span className="sidebar-icon">
              <img src={option.icon} alt="" className="icon-normal" />
              <img src={option.iconHover} alt="" className="icon-hover" />
            </span>

            <span className="sidebar-text">{option.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
