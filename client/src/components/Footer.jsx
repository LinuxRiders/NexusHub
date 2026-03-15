import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import logo from "../assets/img/logo.png";
import facebook from "../assets/img/icons/redes/facebook.png";
import instagram from "../assets/img/icons/redes/instagram.png";
import linkedin from "../assets/img/icons/redes/linkedin.png";

const Footer = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    numero: "",
    mensaje: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Mensaje enviado correctamente");
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
              <Link to="/servicios">Servicios</Link>
              <Link to="/propiedades">Propiedades</Link>
            </div>

            <div className="footer-column">
              <h3>Enlaces</h3>

              <Link to="/contacto">Contacto</Link>
              <Link to="/faq">Preguntas Frecuentes</Link>
              <Link to="/privacidad">Política de Privacidad</Link>
              <Link to="/terminos">Términos y Condiciones</Link>
              <Link to="/cookies">Política de Cookies</Link>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="footer-form-wrapper">
          <div className="footer-form-border"></div>

          <form className="footer-form" onSubmit={handleSubmit}>
            <h2>
              Tu espacio ideal <span>aquí</span>
            </h2>

            <p className="footer-contact">¡Contáctanos!</p>

            <label>Nombres*</label>
            <input
              name="nombres"
              type="text"
              placeholder="Introduce tu nombre"
              onChange={handleChange}
              required
            />

            <label>Apellidos*</label>
            <input
              name="apellidos"
              type="text"
              placeholder="Introduce tu apellido"
              onChange={handleChange}
              required
            />

            <label>Email*</label>
            <input
              name="email"
              type="email"
              placeholder="Introduce tu email"
              onChange={handleChange}
              required
            />

            <label>Número*</label>
            <input
              name="numero"
              type="text"
              placeholder="Introduce tu número"
              onChange={handleChange}
              required
            />

            <label>Mensaje*</label>
            <textarea
              name="mensaje"
              placeholder="Introduce tu mensaje"
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">Enviar</button>
          </form>
        </div>
      </div>

      {/* LINEA */}
      <div className="footer-divider"></div>

      {/* REDES */}
      <div className="footer-socials">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={instagram} alt="Instagram" />
        </a>

        <a
          href="https://facebook.com"
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
