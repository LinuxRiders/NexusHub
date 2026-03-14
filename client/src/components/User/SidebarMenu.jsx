// src/components/User/SidebarMenu/SidebarMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos el hook de navegación
import {
  FaUser,
  FaLock,
  FaBell,
  FaHeart,
  FaTimesCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import "./SidebarMenu.css";

const SidebarMenu = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate(); // Inicializamos la navegación

  const menuOptions = [
    { id: "datos", label: "Datos del usuario", icon: <FaUser /> },
    { id: "contraseña", label: "Cambiar contraseña", icon: <FaLock /> },
    { id: "alertas", label: "Mis alertas", icon: <FaBell /> },
    { id: "favoritos", label: "Mis favoritos", icon: <FaHeart /> },
    { id: "baja", label: "Darme de baja", icon: <FaTimesCircle /> },
    { id: "salir", label: "Salir", icon: <FaSignOutAlt /> },
  ];

  const handleMenuClick = (id) => {
    if (id === "salir") {
      // Aquí podrías agregar lógica extra de cierre de sesión si la tuvieras
      // Ejemplo: localStorage.removeItem("userToken");

      // Redirigimos al inicio
      navigate("/");
    } else {
      // Si es cualquier otra pestaña, simplemente la activamos
      setActiveTab(id);
    }
  };

  return (
    <div className="sidebar-menu-container">
      <ul className="sidebar-list">
        {menuOptions.map((option) => (
          <li
            key={option.id}
            className={`sidebar-item ${activeTab === option.id ? "active" : ""}`}
            onClick={() => handleMenuClick(option.id)}
          >
            <span className="sidebar-icon">{option.icon}</span>
            <span className="sidebar-text">{option.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
