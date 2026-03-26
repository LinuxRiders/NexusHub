import React from "react";
import "./UnPaso.css";

import llamada from "../../assets/img/icons/unPaso/llamada.png";
import ubicacion from "../../assets/img/icons/unPaso/ubicacion.png";
import email from "../../assets/img/icons/unPaso/email.png";

const UnPaso = () => {
  return (
    <section className="unpaso-container">
      <h2 className="unpaso-title" data-aos="fade-down">
        ¡Estás a un paso de lograrlo!
      </h2>
      <div className="unpaso-divider"></div>

      <p className="unpaso-subtitle" data-aos="fade-up" data-aos-delay="100">
        Conoce nuestros canales de contacto más frecuentes
      </p>

      <div className="unpaso-options">
        {/* TELEFONO */}
        <a
          href="tel:+51902326443"
          className="unpaso-item"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="icon-wrapper">
            <div className="icon-frame"></div>

            <div className="icon-card">
              <img src={llamada} alt="Llamada" className="icon-img" />
            </div>
          </div>

          <h3>Llámanos</h3>
          <span>902 326 443</span>
        </a>

        <div className="line"></div>

        {/* MAPS */}
        <a
          href="https://maps.app.goo.gl/fUiaEfknv9PQG7at8"
          target="_blank"
          rel="noopener noreferrer"
          className="unpaso-item"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="icon-wrapper">
            <div className="icon-frame"></div>

            <div className="icon-card">
              <img src={ubicacion} alt="Ubicación" className="icon-img" />
            </div>
          </div>

          <h3>Encuéntranos</h3>
          <span>
            Avenida Husares de Junin 1188 <br />
            Oficina 101 Urbanización La merced III etapa <br />
            Trujillo
          </span>
        </a>

        <div className="line"></div>

        {/* EMAIL */}
        <a
          href="mailto:nexushubcorporationrs@gmail.com"
          className="unpaso-item"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          <div className="icon-wrapper">
            <div className="icon-frame"></div>

            <div className="icon-card">
              <img src={email} alt="Email" className="icon-img" />
            </div>
          </div>

          <h3>Envía un Email</h3>
          <span>nexushubcorporationrs@gmail.com</span>
        </a>
      </div>
    </section>
  );
};

export default UnPaso;
