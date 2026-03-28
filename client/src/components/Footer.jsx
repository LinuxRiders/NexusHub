import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import logo from "../assets/img/logo.png";
import facebook from "../assets/img/icons/redes/facebook.png";
import instagram from "../assets/img/icons/redes/instagram.png";
import linkedin from "../assets/img/icons/redes/linkedin.png";
import { useAuth } from "../context/AuthProvider";
import api from "../api/api";

const Footer = () => {
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
        subject: "Contacto desde el Footer",
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
    <footer className="footer">
      <div className="footer-container">
        {/* IZQUIERDA */}
        <div className="footer-left">
          <div className="footer-brand">
            <img src={logo} alt="Nexus Hub" />
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3>Nuestra Compañía</h3>

              <Link to="/login">Login</Link>
              <Link to="/">Inicio</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/#servicios">Servicios</Link>
              <Link to="/propiedades">Propiedades</Link>
            </div>

            <div className="footer-column">
              <h3>Enlaces</h3>
              <Link to="/#contacto" state={{ tab: "contacto" }}>
                Contacto
              </Link>
              <Link to="/faq" state={{ tab: "faq" }}>
                Preguntas Frecuentes
              </Link>
              <Link to="/legalidades/privacidad" state={{ tab: "privacidad" }}>
                Política de Privacidad
              </Link>
              <Link to="/legalidades/terminos" state={{ tab: "terminos" }}>
                Términos y Condiciones
              </Link>
              <Link to="/legalidades/cookies" state={{ tab: "cookies" }}>
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="footer-form-wrapper">
          <div className="footer-form-border"></div>

          <form
            className="footer-form"
            onSubmit={handleSubmit}
            onFocus={handleFocus}
          >
            <h2>
              Tu espacio ideal <span>aquí</span>
            </h2>

            <p className="footer-contact">¡Contáctanos!</p>

            <label>Nombres*</label>
            <input
              name="nombres"
              type="text"
              value={formData.nombres}
              placeholder="Introduce tu nombre"
              onChange={handleChange}
              required
            />

            <label>Apellidos*</label>
            <input
              name="apellidos"
              type="text"
              value={formData.apellidos}
              placeholder="Introduce tu apellido"
              onChange={handleChange}
              required
            />

            <label>Email*</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              placeholder="Introduce tu email"
              onChange={handleChange}
              required
            />

            <label>Número*</label>
            <input
              name="numero"
              type="text"
              value={formData.numero}
              placeholder="Introduce tu número"
              onChange={handleChange}
              required
            />

            <label>Mensaje*</label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              placeholder="Introduce tu mensaje"
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </div>

      {/* LINEA */}
      <div className="footer-divider"></div>

      {/* REDES */}
      <div className="footer-socials">
        <a
          href="https://www.instagram.com/nexushubcorporationrs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={instagram} alt="Instagram" />
        </a>

        <a
          href="https://www.facebook.com/profile.php?id=61577553609778"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={facebook} alt="Facebook" />
        </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={linkedin} alt="LinkedIn" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
