import React, { useState, useEffect } from "react";
import "./Banner.css";
import heroImage from "../../assets/img/hero.jpg";
import logo from "../../assets/img/logoLetra.png"; // Importamos el logo
import { Box } from "@mui/material";
import { useAuth } from "../../context/AuthProvider";
import api from "../../api/api";

const Banner = ({ sx = {} }) => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    numero: "",
    mensaje: "",
  });

  const handleFocus = () => {
    if (isAuthenticated && user && !hasAutoFilled) {
      setFormData((prev) => ({
        ...prev,
        nombres: prev.nombres || user.nombres || user.username || "",
        apellidos: prev.apellidos || user.apellidos || "",
        email: prev.email || user.email || "",
        numero: prev.numero || user.telefono || "",
      }));
      setHasAutoFilled(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/messages", {
        name: `${formData.nombres} ${formData.apellidos}`.trim(),
        email: formData.email,
        phone: formData.numero,
        message: formData.mensaje,
        subject: "Contacto desde Banner Principal",
      });
      alert("¡Mensaje enviado correctamente! Te contactaremos pronto.");
      setFormData({
        nombres: "",
        apellidos: "",
        email: "",
        numero: "",
        mensaje: "",
      });
      setHasAutoFilled(false);
      if (document.activeElement) document.activeElement.blur();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Ocurrió un error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

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

          <form
            className="hero-form"
            onSubmit={handleSubmit}
            onFocus={handleFocus}
          >
            <h2>
              Tu espacio ideal <span>aquí</span>
            </h2>

            <p className="hero-contact">¡Contáctanos!</p>

            <label>Nombres*</label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Introduce tu nombre"
              required
            />

            <label>Apellidos*</label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Introduce tu apellido"
              required
            />

            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Introduce tu email"
              required
            />

            <label>Número*</label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Introduce tu número"
              required
            />

            <label>Mensaje*</label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Introduce tu mensaje"
              required
            ></textarea>

            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </Box>
    </section>
  );
};

export default Banner;
