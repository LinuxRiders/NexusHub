import React from "react";
import "../styles/Mantenimiento.css"; // Asegúrate de que la ruta sea correcta
// import hexa from "../assets/hexa.png";

const Mantenimiento = () => {
  return (
    <div className="mainte">
      {/* Contenedor de Texto (Añadido para visualizar la fuente Nunito) */}
      <div className="mainte-content">
        <h1>Sitio en Mantenimiento</h1>
        <p>Estamos trabajando para mejorar tu experiencia. Vuelve pronto.</p>
      </div>

      {/* https://codepen.io/zkreations/pen/VGWzYv */}
      <div className="wave">
        {/* Fondo Hexagonos */}
        <img
          // src={hexa}
          alt="hexagonos"
          className="hexa-bg"
        />
        <div className="wave-item"></div>
      </div>
    </div>
  );
};

export default Mantenimiento;
