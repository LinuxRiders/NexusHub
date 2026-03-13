import React from "react";
import "./ServiciosAdicionales.css";

import proyectoImg from "../../assets/img/proyecto.jpg";
import saneamientoImg from "../../assets/img/saneamiento.jpg";

const ServiciosAdicionales = () => {
  return (
    <section className="servicios-container">
      <h2 className="servicios-title">Servicios adicionales</h2>
      <div className="servicios-divider"></div>

      <div className="servicios-cards">
        {/* CARD 1 */}
        <div className="servicio-card">
          <img src={proyectoImg} alt="Proyecto" />

          <div className="servicio-content">
            <h3>¿Tienes un proyecto en mente?</h3>

            <p>
              Cuéntanos en qué etapa te encuentras y recibe asesoría estratégica
              para tomar mejores decisiones desde el inicio.
            </p>

            <button>Solicitar asesoría</button>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="servicio-card">
          <img src={saneamientoImg} alt="Saneamiento" />

          <div className="servicio-content">
            <h3>¡Saneamiento legal de propiedades!</h3>

            <p>
              Regulariza tu inmueble y evita problemas legales antes de vender,
              comprar o heredar.
            </p>

            <button>Consultar saneamiento</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiciosAdicionales;
