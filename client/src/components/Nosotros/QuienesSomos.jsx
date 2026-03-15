import React, { useEffect, useRef, useState } from "react";
import "./QuienesSomos.css";

import building1 from "../../assets/img/torres.jpg";
import building2 from "../../assets/img/torres.jpg";
import agent from "../../assets/img/ejecutivo.png";
import vectores from "../../assets/img/vectores.png";

const QuienesSomos = () => {
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
      className={`quienes ${isVisible ? "visible" : ""}`}
      ref={sectionRef}
      style={{ "--bg-vectores": `url(${vectores})` }}
    >
      <div className="quienes-container">
        {/* FILA SUPERIOR */}
        <div className="quienes-top">
          <div className="quienes-left">
            <div className="quienes-text">
              <h2>¿Quienes Somos?</h2>
              <div className="quienes-line"></div>

              <p>
                Somos una empresa dedicada a ofrecer un
                <strong> servicio completo en el rubro inmobiliario</strong>,
                que abarca la renta de inmuebles, la intermediación en
                compraventa de propiedades y el saneamiento legal de
                propiedades.
              </p>

              <p>
                En Nexus Hub facilitamos cada paso del proceso inmobiliario:
                <strong>
                  alquilar una vivienda, comprar la casa de tus sueños o
                  regularizar la documentación
                </strong>
                de tu propiedad, nuestro equipo profesional te acompañará de
                principio a fin
              </p>
            </div>
          </div>

          <div className="quienes-right">
            <div className="quienes-buildings">
              <div
                className="building left"
                style={{ backgroundImage: `url(${building1})` }}
              />

              <div
                className="building right"
                style={{ backgroundImage: `url(${building2})` }}
              />
            </div>
          </div>
        </div>

        {/* FILA INFERIOR */}
        <div className="quienes-bottom">
          <img src={agent} alt="Ejecutivo" className="quienes-agent" />

          <div className="quienes-bottom-text">
            <p>
              En Nexus Hub nos diferenciamos por nuestra
              <strong>
                {" "}
                atención personalizada y cercanía con el cliente.
              </strong>
            </p>

            <p>
              Nos enorgullece combinar
              <strong>
                conocimiento del mercado local de Trujillo con asesoría legal
                especializada
              </strong>
              , brindándote orientación honesta y soluciones a la medida de tus
              necesidades
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuienesSomos;
