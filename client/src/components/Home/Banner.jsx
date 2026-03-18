import React from "react";
import "./Banner.css";
import heroImage from "../../assets/img/hero.jpg";
import logo from "../../assets/img/logoLetra.png"; // Importamos el logo
import { Box } from "@mui/material";

const Banner = ({ sx = {} }) => {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(${heroImage})`,
        maxWidth: "100vw",
        width: "100%",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      <div className="hero-overlay"></div>

      <Box className="hero-container" sx={sx}>
        {/* TEXTO IZQUIERDA */}
        <div className="hero-left">
          {/* CAMBIO AQUÍ: Imagen en lugar del texto */}
          <h1 className="hero-title" data-aos="fade-right">
            <img src={logo} alt="NEXUS HUB" className="hero-logo-img" />
          </h1>

          <p
            className="hero-subtitle"
            data-aos="fade-right"
            data-aos-delay="150"
          >
            Servicios Completos
          </p>

          <ul className="hero-list">
            <li data-aos="fade-up" data-aos-delay="300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="hero-check-icon"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
              </svg>
              Renta de Inmuebles
            </li>

            <li data-aos="fade-up" data-aos-delay="450">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="hero-check-icon"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
              </svg>
              Compra y Venta de propiedades
            </li>

            <li data-aos="fade-up" data-aos-delay="600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="hero-check-icon"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
              </svg>
              Saneamiento legal
            </li>
          </ul>
        </div>

        {/* FORMULARIO */}
        <div
          className="hero-form-wrapper"
          data-aos="fade-left"
          data-aos-delay="300"
        >
          <div className="hero-form-border"></div>

          <form className="hero-form">
            <h2>
              Tu espacio ideal <span>aquí</span>
            </h2>

            <p className="hero-contact">¡Contáctanos!</p>

            <label>Nombres*</label>
            <input type="text" placeholder="Introduce tu nombre" required />

            <label>Apellidos*</label>
            <input type="text" placeholder="Introduce tu apellido" required />

            <label>Email*</label>
            <input type="email" placeholder="Introduce tu email" required />

            <label>Número*</label>
            <input type="text" placeholder="Introduce tu número" required />

            <label>Mensaje*</label>
            <textarea placeholder="Introduce tu mensaje" required></textarea>

            <button type="submit">Enviar</button>
          </form>
        </div>
      </Box>
    </section>
  );
};

export default Banner;
