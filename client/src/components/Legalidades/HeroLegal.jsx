import React from "react";
import "./HeroLegal.css";
import heroImage from "../../assets/img/HeroUser.jpg";

const HeroLegal = () => {
  return (
    <section
      className="legal-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="legal-hero-content">
        <h1>Legalidades</h1>

        <div className="legal-line"></div>
      </div>
    </section>
  );
};

export default HeroLegal;
