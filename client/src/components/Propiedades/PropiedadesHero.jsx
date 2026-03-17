import React from "react";
import "./PropiedadesHero.css";
import heroImage from "../../assets/img/heroPropiedades.jpg";

const PropiedadesHero = () => {
  return (
    <section
      className="propiedades-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="propiedades-hero-content">
        <h1 data-aos="fade-down">Propiedades</h1>

        <div
          className="propiedades-line"
          data-aos="zoom-in"
          data-aos-delay="100"
        ></div>

        <p data-aos="fade-up" data-aos-delay="200">
          Tu próxima propiedad te está esperando. Encuentra el espacio perfecto
          para vivir o invertir.
        </p>
      </div>
    </section>
  );
};

export default PropiedadesHero;
