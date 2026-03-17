import React, { useState } from "react";
import HeroUser from "../components/User/HeroUser"; // Descomenta esta línea para usar tu Hero
import SidebarMenu from "../components/User/SidebarMenu";
import UserData from "../components/User/UserData";
import UserPassword from "../components/User/UserPassword";
import UserAlerts from "../components/User/UserAlerts";
import UserFavorites from "../components/User/UserFavorites";
import UserUnsubscribe from "../components/User/UserUnsubscribe";

// Importamos la imagen de la marca de agua
import marcaAgua from "../assets/img/MarcaAgua.png";

import "./Perfil.css";

const Perfil = () => {
  const [activeTab, setActiveTab] = useState("datos");

  const renderContent = () => {
    switch (activeTab) {
      case "datos":
        return <UserData />;
      case "contraseña":
        return <UserPassword />;
      case "alertas":
        return <UserAlerts />;
      case "favoritos":
        return <UserFavorites />;
      case "baja":
        return <UserUnsubscribe />;
      default:
        return <UserData />;
    }
  };

  return (
    <div className="user-page">
      <HeroUser />
      <div className="user-main-layout">
        {/* Contenedor de la marca de agua ajustado */}
        <div className="watermark-container">
          <img
            src={marcaAgua}
            alt="Marca de agua"
            className="watermark-image"
          />
        </div>

        <div className="user-content-wrapper">
          <SidebarMenu activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="user-dynamic-panel">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
