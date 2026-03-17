import React, { useState, useEffect } from "react";
import "./PropuestasValor.css";

import edificio from "../../assets/img/icons/propuestasValor/edificio.png";
import eficiencia from "../../assets/img/icons/propuestasValor/eficiencia.png";
import martillo from "../../assets/img/icons/propuestasValor/martillo.png";
import persona from "../../assets/img/icons/propuestasValor/persona.png";

const PropuestasValor = () => {
  // Estado para el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Arreglo con la información de las tarjetas para iterar fácilmente
  const cards = [
    {
      id: 1,
      img: edificio,
      title: "Soluciones inmobiliarias",
      desc: "No nos limitamos a la intermediación. Acompañamos al cliente en todo el ciclo inmobiliario.",
    },
    {
      id: 2,
      img: persona,
      title: "Atención personalizada",
      desc: "Cada cliente recibe un asesoramiento a medida, alineado a sus objetivos patrimoniales, comerciales o de inversión.",
    },
    {
      id: 3,
      img: martillo,
      title: "Respaldo legal y técnico",
      desc: "Incorporamos análisis legal y documental en cada operación, reduciendo riesgos y brindando seguridad jurídica.",
    },
    {
      id: 4,
      img: eficiencia,
      title: "Eficiencia y transparencia",
      desc: "Procesos claros, información precisa y comunicación constante durante toda la gestión inmobiliaria.",
    },
  ];

  // Detectar tamaño de pantalla para ajustar el número de tarjetas visibles
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setItemsPerPage(4); // PC: 4 tarjetas
        setCurrentIndex(0); // Reiniciar índice
      } else if (window.innerWidth > 768) {
        setItemsPerPage(2); // Tablet: 2 tarjetas
      } else {
        setItemsPerPage(1); // Celular: 1 tarjeta
      }
    };

    handleResize(); // Ejecutar al inicio
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lógica para cambiar tarjetas
  const handlePrev = () => {
    if (itemsPerPage === 4) return; // En PC no hace nada
    setCurrentIndex((prev) => {
      if (prev - itemsPerPage < 0) {
        return cards.length - itemsPerPage;
      }
      return prev - itemsPerPage;
    });
  };

  const handleNext = () => {
    if (itemsPerPage === 4) return; // En PC no hace nada
    setCurrentIndex((prev) => {
      if (prev + itemsPerPage >= cards.length) {
        return 0;
      }
      return prev + itemsPerPage;
    });
  };

  // Obtener solo las tarjetas que deben ser visibles
  const visibleCards = cards.slice(currentIndex, currentIndex + itemsPerPage);

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
        <div
          className="valor-arrow"
          onClick={handlePrev}
          // Ocultamos las flechas en PC para que no estorben, pero mantienen el espacio (visibility)
          style={{ visibility: itemsPerPage === 4 ? "hidden" : "visible" }}
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <polygon points="16,4 6,12 16,20"></polygon>
          </svg>
        </div>

        {/* GRID DE CARDS */}
        <div className="valor-grid">
          {visibleCards.map((card) => (
            <div
              className="valor-card"
              // Al combinar el index con el id, forzamos a react a volver a montar la tarjeta, reactivando la animación CSS
              key={`${currentIndex}-${card.id}`}
            >
              <img src={card.img} alt={card.title} className="valor-icon" />
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* FLECHA DERECHA */}
        <div
          className="valor-arrow"
          onClick={handleNext}
          style={{ visibility: itemsPerPage === 4 ? "hidden" : "visible" }}
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <polygon points="8,4 18,12 8,20"></polygon>
          </svg>
        </div>
      </div>

      {/* PESTAÑA INFERIOR */}
      <div className="valor-tab">
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
