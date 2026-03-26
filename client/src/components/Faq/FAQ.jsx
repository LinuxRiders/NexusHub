import React, { useState, useEffect } from "react";
import flecha from "../../assets/img/icons/flechaFAQ.png";
import "./FAQ.css";

// --- SUBCOMPONENTE DE LA TARJETA ---
const FaqCard = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-card-wrapper ${isOpen ? "open" : ""}`}>
      <div className="faq-question-bar" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="faq-question-text">{question}</h3>
        <img
          src={flecha}
          alt="Desplegar"
          className={`faq-icon-img ${isOpen ? "rotated" : ""}`}
        />
      </div>

      <div className={`faq-answer-panel ${isOpen ? "expanded" : ""}`}>
        <div className="faq-answer-inner">
          <div className="faq-answer-content">
            {/* 🔥 CAMBIO CLAVE: Cambiado <p> por <div>. 
                Al recibir HTML enriquecido, NUNCA debe inyectarse dentro de un <p> */}
            <div
              className="faq-answer-rich-text"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (VISTA USUARIO) ---
const FAQ = () => {
  const [faqData, setFaqData] = useState([]);

  // Simulamos la carga desde el backend con los datos de ejemplo (formato HTML string)
  useEffect(() => {
    const fetchFaqs = async () => {
      // En el futuro esto será: const response = await api.get('/faqs'); setFaqData(response.data);
      const dataFromBackend = [
        {
          id: 1,
          question: "¿Cómo puedo alquilar una propiedad con Nexus Hub?",
          answer:
            "<p>Para alquilar un inmueble a través de nosotros, el <strong>primer paso</strong> es contactarnos y contarnos qué estás buscando...</p><p>Te acompañamos durante todo el proceso de alquiler: <strong>desde la verificación de la documentación</strong>, la firma del contrato hasta la entrega de llaves. Nos aseguramos de que el <strong>contrato sea claro y justo</strong>.</p>",
        },
        {
          id: 2,
          question:
            "Soy propietario, ¿cómo me ayudan a vender o alquilar mi inmueble?",
          answer:
            "<p>Nexus Hub te ofrece un <strong>servicio integral</strong>. Esto incluye:</p><ul><li>Una <strong>tasación profesional</strong>.</li><li>Promoción en canales digitales.</li><li>Pre-selección de interesados y visitas.</li></ul><p><strong>Nuestro objetivo es que vendas o arriendes tu propiedad de forma rápida, segura y al mejor valor</strong>.</p>",
        },
      ];

      // Al recibir del backend, se setean directamente
      setFaqData(dataFromBackend);
    };

    fetchFaqs();
  }, []);

  return (
    <div className="faq-global-wrapper">
      <div className="faq-cards-list">
        {faqData.map((faq) => (
          <FaqCard key={faq.id} question={faq.question} answer={faq.answer} />
        ))}
        {faqData.length === 0 && (
          <p style={{ textAlign: "center", color: "#8a8a8a" }}>
            No hay preguntas frecuentes disponibles por el momento.
          </p>
        )}
      </div>
    </div>
  );
};

export default FAQ;
