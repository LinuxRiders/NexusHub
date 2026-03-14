import React from "react";
import "./HeroUser.css";
import heroImage from "../../assets/img/heroUser.jpg";

const HeroUser = () => {
  return (
    <section
      className="user-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="user-hero-content">
        <h1>Mi cuenta</h1>

        <div className="user-line"></div>

        {/* <p>
          Bienvenido a Nexus Hub Corporation, tu aliado en soluciones
          inmobiliarias integrales en Trujillo
        </p> */}
      </div>
    </section>
  );
};

export default HeroUser;
