import React from "react";
import "./FaqHero.css";
import heroImage from "../../assets/img/heroFaq.png";
import logo from "../../assets/img/logo2.png";

const FaqHero = () => {
  return (
    <section
      className="faq-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="faq-hero-content">
        {/* LOGO */}
        <img src={logo} alt="Nexus Hub Logo" className="faq-hero-logo" />

        {/* TÍTULO Y TEXTO (Sin data-aos para evitar que se queden invisibles) */}
        <h1>Preguntas Frecuentes</h1>

        <div className="faq-line"></div>

        <p>¿Tienes dudas? Resuelve todas aquí</p>
      </div>
    </section>
  );
};

export default FaqHero;
