import React from "react";
import "./PropuestasValor.css";

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
          {/* triangulo relleno */}
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <polygon points="16,4 6,12 16,20"></polygon>
          </svg>
        </div>

        {/* GRID DE CARDS */}
        <div className="valor-grid">
          {/* CARD 1 */}
          <div className="valor-card">
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 1a1 1 0 0 0-1 1v13h14V2a1 1 0 0 0-1-1H2zm2 2h2v2H4V3zm0 4h2v2H4V7zm0 4h2v2H4v-2zm4-8h2v2H8V3zm0 4h2v2H8V7zm0 4h2v2H8v-2zm4-8h2v10h-2V3z" />
            </svg>

            <h3>Soluciones inmobiliarias</h3>

            <p>
              No nos limitamos a la intermediación. Acompañamos al cliente en
              todo el ciclo inmobiliario.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="valor-card">
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0-0.001-6.001A3 3 0 0 0 8 8z" />
              <path d="M14 14s-1-4-6-4-6 4-6 4v1h12v-1z" />
            </svg>

            <h3>Atención personalizada</h3>

            <p>
              Cada cliente recibe un asesoramiento a medida, alineado a sus
              objetivos patrimoniales, comerciales o de inversión.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="valor-card">
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.5 0L7 1h2l.5-1H6.5zM3 3h10v2H3V3zm1 3h8l-1 8H5L4 6z" />
            </svg>

            <h3>Respaldo legal y técnico</h3>

            <p>
              Incorporamos análisis legal y documental en cada operación,
              reduciendo riesgos y brindando seguridad jurídica.
            </p>
          </div>

          {/* CARD 4 */}
          <div className="valor-card">
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 8l6-5 6 5v6H2V8zm6-3L4 8h8L8 5z" />
            </svg>

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

      {/* PESTAÑA INFERIOR TRIANGULAR CON PUNTA REDONDEADA */}
      <div className="valor-tab">
        {/* triangulo con curva en la punta */}
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

        {/* CHEVRON ANCHO */}
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
