import React, { useEffect, useRef, useState } from "react";
import "./MisionVision.css";

import building from "../../assets/img/proyecto.jpg";

import mision from "../../assets/img/icons/mision.png";
import vision from "../../assets/img/icons/vision.png";
import comillas from "../../assets/img/icons/comillas.png";

const MisionVision = () => {
  return (
    <section className="misionvision">
      <div className="mv-container">
        {/* PARTE SUPERIOR */}
        <div className="mv-top">
          {/* MISION */}
          <div className="mv-item" data-aos="fade-up">
            <div className="mv-icon-wrapper">
              <div className="mv-icon-border"></div>

              <div className="mv-icon">
                <img src={mision} alt="Misión" />
              </div>
            </div>

            <h3>Misión</h3>

            <p>
              Nuestra misión es hacerte la vida más fácil en tus gestiones
              inmobiliarias, convirtiéndonos en tu socio de confianza. Creemos
              en construir relaciones a largo plazo basadas en resultados y
              satisfacción.
            </p>
          </div>

          <div className="mv-line"></div>

          {/* VISION */}
          <div className="mv-item" data-aos="fade-up" data-aos-delay="200">
            <div className="mv-icon-wrapper">
              <div className="mv-icon-border"></div>

              <div className="mv-icon">
                <img src={vision} alt="Visión" />
              </div>
            </div>

            <h3>Visión</h3>

            <p>
              Nuestro enfoque profesional se refleja en cada asesoría: desde la
              valuación justa de un inmueble hasta la negociación efectiva,
              siempre actuamos con transparencia, integridad y responsabilidad.
            </p>
          </div>
        </div>

        {/* PARTE INFERIOR */}
        <div className="mv-bottom">
          <img
            src={building}
            alt="edificio"
            className="mv-image"
            data-aos="fade-right"
          />

          <div className="mv-card" data-aos="fade-left" data-aos-delay="200">
            <img src={comillas} alt="comillas" className="mv-quote" />

            <p>
              En <strong>Nexus Hub</strong> encontrarás un aliado comprometido.
              Confía en nosotros: te brindaremos la orientación experta y el
              apoyo necesario para que logres el mejor resultado en cada
              operación.
            </p>

            <h4>
              ¡Estamos listos para asesorarte en tu próxima aventura
              inmobiliaria!
            </h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MisionVision;
