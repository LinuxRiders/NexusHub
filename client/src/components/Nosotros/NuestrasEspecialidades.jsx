import React from "react";
import "./NuestrasEspecialidades.css";

import { FaBuilding } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa";
import { FaGavel } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

const NuestrasEspecialidades = () => {
  return (
    <section className="especialidades">
      <div className="especialidades-container">
        {/* IZQUIERDA */}
        <div className="especialidades-left">
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
          <div className="especialidad">
            <div className="icon-box">
              <FaBuilding />
            </div>
            <p>
              Renta de
              <br />
              Inmuebles
            </p>
          </div>

          <div className="especialidad">
            <div className="icon-box">
              <FaHandshake />
            </div>
            <p>
              Intermediación
              <br />
              en Compraventa
            </p>
          </div>

          <div className="especialidad">
            <div className="icon-box">
              <FaGavel />
            </div>
            <p>
              Saneamiento
              <br />
              Físico-legal
            </p>
          </div>

          <div className="especialidad">
            <div className="icon-box">
              <FaFileAlt />
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
