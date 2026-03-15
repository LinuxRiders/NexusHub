import React, { useEffect, useRef, useState } from "react";
import "./NuestrasEspecialidades.css";

import { FiArrowRight } from "react-icons/fi";

import inmueble from "../../assets/img/icons/nuestrasEsp/inmueble.png";
import martillo from "../../assets/img/icons/nuestrasEsp/martillo.png";
import papel from "../../assets/img/icons/nuestrasEsp/papel.png";
import trato from "../../assets/img/icons/nuestrasEsp/trato.png";

const NuestrasEspecialidades = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`especialidades ${isVisible ? "visible" : ""}`}
      ref={sectionRef}
    >
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
              <img src={inmueble} alt="Renta de Inmuebles" />
            </div>
            <p>
              Renta de
              <br />
              Inmuebles
            </p>
          </div>

          <div className="especialidad">
            <div className="icon-box">
              <img src={trato} alt="Intermediación en Compraventa" />
            </div>
            <p>
              Intermediación
              <br />
              en Compraventa
            </p>
          </div>

          <div className="especialidad">
            <div className="icon-box">
              <img src={martillo} alt="Saneamiento Físico Legal" />
            </div>
            <p>
              Saneamiento
              <br />
              Físico-legal
            </p>
          </div>

          <div className="especialidad">
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
