import React from "react";
import "./UnPaso.css";

import { FaPhoneAlt } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { HiMail } from "react-icons/hi";

const UnPaso = () => {
  return (
    <section className="unpaso-container">
      <h2 className="unpaso-title">¡Estás a un paso de lograrlo!</h2>
      <div className="unpaso-divider"></div>

      <p className="unpaso-subtitle">
        Conoce nuestros canales de contacto más frecuentes
      </p>

      <div className="unpaso-options">
        {/* TELEFONO */}
        <a href="tel:+51900000000" className="unpaso-item">
          <div className="icon-wrapper">
            <div className="icon-frame"></div>

            <div className="icon-card">
              <FaPhoneAlt className="icon" />
            </div>
          </div>

          <h3>Llámanos</h3>
          <span>000 000 000</span>
        </a>

        <div className="line"></div>

        {/* MAPS */}
        <a
          href="https://maps.google.com/?q=Trujillo,Peru"
          target="_blank"
          rel="noopener noreferrer"
          className="unpaso-item"
        >
          <div className="icon-wrapper">
            <div className="icon-frame"></div>

            <div className="icon-card">
              <MdLocationOn className="icon" />
            </div>
          </div>

          <h3>Encuéntranos</h3>
          <span>Dirección, Trujillo Perú</span>
        </a>

        <div className="line"></div>

        {/* EMAIL */}
        <a href="mailto:correo@nexus.pe" className="unpaso-item">
          <div className="icon-wrapper">
            <div className="icon-frame"></div>

            <div className="icon-card">
              <HiMail className="icon" />
            </div>
          </div>

          <h3>Envía un Email</h3>
          <span>correo@nexus.pe</span>
        </a>
      </div>
    </section>
  );
};

export default UnPaso;
