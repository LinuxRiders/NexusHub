import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // 🔥 IMPORTANTE: Importar useLocation

import HeroLegal from "../components/Legalidades/HeroLegal";
import SidebarLegal from "../components/Legalidades/SidebarLegal";
// import FAQ from "../components/Legalidades/FAQ";
import PoliticaPrivacidad from "../components/Legalidades/PoliticaPrivacidad";
import TerminosCondiciones from "../components/Legalidades/TerminosCondiciones";
import PoliticaCook from "../components/Legalidades/PoliticaCook";
import marcaAgua from "../assets/img/MarcaAgua.png";
import "./Legalidades.css";

const Legalidades = () => {
  const location = useLocation(); // 🔥 Obtenemos la información de la ruta

  // Inicializamos la pestaña con lo que venga del Footer, o "faq" por defecto
  const [activeTab, setActiveTab] = useState(location.state?.tab || "faq");

  // Este useEffect "escucha" si cambia el estado desde el Footer mientras ya estás en la página
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      // Opcional y muy recomendado: hacer que la pantalla suba al inicio al cambiar de pestaña
      window.scrollTo(0, 0);
    }
  }, [location.state]); // Se ejecuta cada vez que el state del Link cambia

  const renderContent = () => {
    switch (activeTab) {
      // case "faq":
      //   return <FAQ />;
      case "privacidad":
        return <PoliticaPrivacidad />;
      case "terminos":
        return <TerminosCondiciones />;
      case "cook":
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
          <SidebarLegal activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="legal-dynamic-panel">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Legalidades;
