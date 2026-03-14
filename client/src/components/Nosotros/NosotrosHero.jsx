import React from "react";
import "./NosotrosHero.css";
import heroImage from "../../assets/img/heroNosotros.png";

const NosotrosHero = () => {
  return (
    <section
      className="nosotros-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="nosotros-hero-content">
        <h1>Nosotros</h1>

        <div className="nosotros-line"></div>

        <p>
          Bienvenido a Nexus Hub Corporation, tu aliado en soluciones
          inmobiliarias integrales en Trujillo
        </p>
      </div>
    </section>
  );
};

export default NosotrosHero;
