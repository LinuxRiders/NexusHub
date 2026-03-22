import React from "react";
import "./HeroAdmin.css";
import heroImage from "../../assets/img/heroUser.jpg";

const HeroAdmin = () => {
  return (
    <section
      className="admin-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="admin-hero-content">
        <h1>Mi cuenta</h1>

        <div className="admin-line"></div>
      </div>
    </section>
  );
};

export default HeroAdmin;
