// src/pages/Admin/Admin.jsx
import React, { useState } from "react";
import HeroUser from "../components/User/HeroUser";
import AdminSidebarMenu from "../components/Admin/AdminSidebarMenu";

// Importamos el Dashboard (Asegúrate de que la ruta sea correcta)
import AdminDashboard from "../components/Admin/AdminDashboard";
import AdminInmuebles from "../components/Admin/AdminInmuebles";
import AdminUsuarios from "../components/Admin/AdminUsuarios";
import AdminFavoritos from "../components/Admin/AdminFavoritos";
import AdminMensajes from "../components/Admin/AdminMensajes";
import AdminAlertas from "../components/Admin/AdminAlertas";

// Importamos la imagen de la marca de agua
import marcaAgua from "../assets/img/MarcaAgua2.png";

import "./Admin.css";

// --- Componentes temporales para el resto de opciones ---

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        // PASAMOS setActiveTab COMO PROP AQUÍ
        return <AdminDashboard setActiveTab={setActiveTab} />;
      case "inmuebles":
        return <AdminInmuebles />;
      case "usuarios":
        return <AdminUsuarios />;
      case "favoritos":
        return <AdminFavoritos />;
      case "mensajes":
        return <AdminMensajes />;
      case "alertas":
        return <AdminAlertas />;
      default:
        // En caso de error, siempre mostramos el dashboard y le pasamos la prop
        return <AdminDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="admin-page">
      <HeroUser />
      <div className="admin-main-layout">
        <div className="admin-watermark-container">
          <img
            src={marcaAgua}
            alt="Marca de agua"
            className="admin-watermark-image"
          />
        </div>

        <div className="admin-content-wrapper">
          {/* El menú lateral ya usa setActiveTab */}
          <AdminSidebarMenu activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="admin-dynamic-panel">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
