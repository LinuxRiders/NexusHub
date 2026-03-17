import React, { useEffect, useRef, useState } from "react";
import "./NuestrasEspecialidades.css";

import { FiArrowRight } from "react-icons/fi";

import inmueble from "../../assets/img/icons/nuestrasEsp/inmueble.png";
import martillo from "../../assets/img/icons/nuestrasEsp/martillo.png";
import papel from "../../assets/img/icons/nuestrasEsp/papel.png";
import trato from "../../assets/img/icons/nuestrasEsp/trato.png";

const NuestrasEspecialidades = () => {
  return (
    <section className="especialidades">
      <div className="especialidades-container">
        {/* IZQUIERDA */}
        <div className="especialidades-left" data-aos="fade-right">
          <h2>
            Nuestras
            <br />
            Especialidades
          </h2>

          <div className="especialidades-line"></div>

          <div className="especialidades-btn">
            <FiArrowRight />
          </div>
        </div>

        {/* LINEA CENTRAL */}
        <div className="especialidades-divider"></div>

        {/* ESPECIALIDADES */}
        <div className="especialidades-items">
          <div
            className="especialidad"
            data-aos="fade-left"
            data-aos-delay="100"
          >
            <div className="icon-box">
              <img src={inmueble} alt="Renta de Inmuebles" />
            </div>
            <p>
              Renta de
              <br />
              Inmuebles
            </p>
          </div>

          <div
            className="especialidad"
            data-aos="fade-left"
            data-aos-delay="250"
          >
            <div className="icon-box">
              <img src={trato} alt="Intermediación en Compraventa" />
            </div>
            <p>
              Intermediación
              <br />
              en Compraventa
            </p>
          </div>

          <div
            className="especialidad"
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <div className="icon-box">
              <img src={martillo} alt="Saneamiento Físico Legal" />
            </div>
            <p>
              Saneamiento
              <br />
              Físico-legal
            </p>
          </div>

          <div
            className="especialidad"
            data-aos="fade-left"
            data-aos-delay="550"
          >
            <div className="icon-box">
              <img src={papel} alt="Trámites y Documentos" />
            </div>
            <p>
              Trámites y Documentos
              <br />
              en Orden
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NuestrasEspecialidades;
