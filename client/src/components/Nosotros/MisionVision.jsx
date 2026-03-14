import React, { useEffect, useRef, useState } from "react";
import "./MisionVision.css";

import { FiTarget, FiEye } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";

import building from "../../assets/img/proyecto.jpg";

const MisionVision = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`misionvision ${isVisible ? "visible" : ""}`}
      ref={sectionRef}
    >
      <div className="mv-container">
        {/* MISION / VISION */}
        <div className="mv-top">
          <div className="mv-item">
            <div className="mv-icon-wrapper">
              <div className="mv-icon-border"></div>
              <div className="mv-icon">
                <FiTarget />
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

          <div className="mv-item">
            <div className="mv-icon-wrapper">
              <div className="mv-icon-border"></div>
              <div className="mv-icon">
                <FiEye />
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
          <img src={building} alt="edificio" className="mv-image" />

          <div className="mv-card">
            <FaQuoteLeft className="mv-quote" />
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
