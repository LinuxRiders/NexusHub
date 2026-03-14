import React from "react";
import "./QueEstasBuscando.css";

/* IMPORTACIÓN DE IMÁGENES
   desde tu carpeta assets/img */
import comprarImg from "../../assets/img/comprar.png";
import venderImg from "../../assets/img/vender.jpg";
import alquilarImg from "../../assets/img/alquilar.png";

const QueEstasBuscando = () => {
  return (
    <section className="qeb-container">
      {/* TÍTULO */}
      <h2 className="qeb-title">¿Qué estás buscando?</h2>

      {/* LINEA DECORATIVA */}
      <div className="qeb-divider"></div>

      {/* SUBTITULO */}
      <p className="qeb-subtitle">
        Ofrecemos soluciones integrales para cada necesidad, ¿Cuál es la tuya?
      </p>

      {/* GRID DE CARDS */}
      <div className="qeb-cards">
        {/* CARD 1 */}
        <div className="qeb-card">
          <img src={comprarImg} alt="Comprar" />

          {/* OVERLAY INFERIOR */}
          <div className="qeb-overlay">
            <span>Comprar</span>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="qeb-card">
          <img src={venderImg} alt="Vender" />

          <div className="qeb-overlay">
            <span>Vender</span>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="qeb-card">
          <img src={alquilarImg} alt="Alquilar" />

          <div className="qeb-overlay">
            <span>Alquilar</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QueEstasBuscando;
