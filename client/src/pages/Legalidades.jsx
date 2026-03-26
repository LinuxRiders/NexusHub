import React, { useEffect } from "react";
import { useParams } from "react-router-dom"; // 🔥 IMPORTANTE: Importar hooks de ruta

import HeroLegal from "../components/Legalidades/HeroLegal";
import SidebarLegal from "../components/Legalidades/SidebarLegal";
// import FAQ from "../components/Legalidades/FAQ";
import PoliticaPrivacidad from "../components/Legalidades/PoliticaPrivacidad";
import TerminosCondiciones from "../components/Legalidades/TerminosCondiciones";
import PoliticaCook from "../components/Legalidades/PoliticaCook";
import marcaAgua from "../assets/img/MarcaAgua.png";
import "./Legalidades.css";
import { FaCookieBite, FaFileContract, FaShieldAlt } from "react-icons/fa";

const menuOptions = [
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
    id: "cookies",
    label: "Política de Cookies",
    icon: <FaCookieBite />,
  },
];

const Legalidades = () => {
  const { tab } = useParams(); // 🔥 Obtenemos la información de la ruta

  // La pestaña activa es el parámetro de la URL, o "privacidad" por defecto
  const activeTab = tab || "privacidad";

  const renderContent = () => {
    switch (activeTab) {
      case "privacidad":
        return <PoliticaPrivacidad />;
      case "terminos":
        return <TerminosCondiciones />;
      case "cookies":
        return <PoliticaCook />;
      default:
        return <PoliticaPrivacidad />;
    }
  };

  return (
    <div className="legal-page">
      <HeroLegal />
      <div className="legal-main-layout">
        <div className="watermark-container">
          <img
            src={marcaAgua}
            alt="Marca de agua"
            className="watermark-image"
          />
        </div>

        <div className="legal-content-wrapper">
          <SidebarLegal menuOptions={menuOptions} activeTab={activeTab} />
          <div className="legal-dynamic-panel">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Legalidades;
