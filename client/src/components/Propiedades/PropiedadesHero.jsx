import React from "react";
import "./PropiedadesHero.css";
import heroImage from "../../assets/img/hero.jpg";

const PropiedadesHero = () => {
  return (
    <section
      className="propiedades-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="propiedades-hero-content">
        <h1>Propiedades</h1>

        <div className="propiedades-line"></div>

        <p>
          Tu próxima propiedad te está esperando. Encuentra el espacio perfecto
          para vivir o invertir.
        </p>
      </div>
    </section>
  );
};

export default PropiedadesHero;
