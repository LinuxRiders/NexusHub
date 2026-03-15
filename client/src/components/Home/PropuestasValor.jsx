import React from "react";
import "./PropuestasValor.css";

import computador from "../../assets/img/icons/propuestasValor/computador.png";
import edificio from "../../assets/img/icons/propuestasValor/edificio.png";
import eficiencia from "../../assets/img/icons/propuestasValor/eficiencia.png";
import foco from "../../assets/img/icons/propuestasValor/foco.png";
import martillo from "../../assets/img/icons/propuestasValor/martillo.png";
import persona from "../../assets/img/icons/propuestasValor/persona.png";

const PropuestasValor = () => {
  return (
    <section className="valor-section">
      {/* TITULO */}
      <h2 className="valor-title">Propuestas de Valor</h2>

      {/* LINEA DECORATIVA */}
      <div className="valor-line"></div>

      {/* DESCRIPCION */}
      <p className="valor-subtitle">
        Nexus Hub Corporation, un aliado confiable, orientado a generar valor
        real y sostenible para sus clientes
      </p>

      {/* CONTENEDOR GENERAL */}
      <div className="valor-container">
        {/* FLECHA IZQUIERDA */}
        <div className="valor-arrow">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <polygon points="16,4 6,12 16,20"></polygon>
          </svg>
        </div>

        {/* GRID DE CARDS */}
        <div className="valor-grid">
          {/* CARD 1 */}
          <div className="valor-card">
            <img
              src={edificio}
              alt="Soluciones inmobiliarias"
              className="valor-icon"
            />

            <h3>Soluciones inmobiliarias</h3>

            <p>
              No nos limitamos a la intermediación. Acompañamos al cliente en
              todo el ciclo inmobiliario.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="valor-card">
            <img
              src={persona}
              alt="Atención personalizada"
              className="valor-icon"
            />

            <h3>Atención personalizada</h3>

            <p>
              Cada cliente recibe un asesoramiento a medida, alineado a sus
              objetivos patrimoniales, comerciales o de inversión.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="valor-card">
            <img
              src={martillo}
              alt="Respaldo legal y técnico"
              className="valor-icon"
            />

            <h3>Respaldo legal y técnico</h3>

            <p>
              Incorporamos análisis legal y documental en cada operación,
              reduciendo riesgos y brindando seguridad jurídica.
            </p>
          </div>

          {/* CARD 4 */}
          <div className="valor-card">
            <img
              src={eficiencia}
              alt="Eficiencia y transparencia"
              className="valor-icon"
            />

            <h3>Eficiencia y transparencia</h3>

            <p>
              Procesos claros, información precisa y comunicación constante
              durante toda la gestión inmobiliaria.
            </p>
          </div>
        </div>

        {/* FLECHA DERECHA */}
        <div className="valor-arrow">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <polygon points="8,4 18,12 8,20"></polygon>
          </svg>
        </div>
      </div>

      {/* PESTAÑA INFERIOR */}
      <div className="valor-tab">
        <svg className="valor-tab-bg" viewBox="0 0 120 50">
          <path
            d="
            M0 0
            L120 0
            L68 36
            A10 6 0 0 1 52 36
            Z
            "
            fill="#206b6f"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="20"
          fill="white"
          viewBox="0 0 16 16"
          className="valor-chevron"
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0
            L8 10.293
            l5.646-5.647a.5.5 0 0 1 .708.708
            l-6 6a.5.5 0 0 1-.708 0
            l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </div>
    </section>
  );
};

export default PropuestasValor;
