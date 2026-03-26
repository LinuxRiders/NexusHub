import React, { useState, useEffect } from "react";
import flecha from "../../assets/img/icons/flechaFAQ.png";
import "./FAQ.css";

// --- SUBCOMPONENTE DE LA TARJETA ---
const FaqCard = ({ question, answer, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

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
            "<p>Para alquilar un inmueble a través de nosotros, el primer paso es contactarnos y contarnos qué estás buscando (tipo de propiedad, ubicación, presupuesto, etc.). Con esa información, nuestro equipo te presentará opciones disponibles que se ajusten a tus necesidades y coordinará visitas a los inmuebles. Te acompañamos durante todo el proceso de alquiler: desde la verificación de la documentación del inmueble, la firma del contrato de arrendamiento hasta la entrega de llaves. Nos aseguramos de que entiendas cada paso y de que el contrato sea claro y justo para ambas partes.</p>",
        },
        {
          id: 2,
          question: "Soy propietario, ¿cómo me ayudan a vender o alquilar mi inmueble?",
          answer:
            "<p>Si eres propietario de una casa, departamento, terreno u otra propiedad en Trujillo, Nexus Hub te ofrece un servicio integral para vender o alquilar tu inmueble. Esto incluye una tasación profesional para determinar el mejor precio de mercado, la promoción de tu propiedad en nuestros canales (web, redes y cartera de clientes), la pre-selección de interesados y la organización de visitas. Negociamos en tu nombre para conseguir las mejores ofertas y te asesoramos en los aspectos legales y contractuales de la transacción. En el caso de alquileres, también podemos gestionar contratos, depósitos de garantía y verificar a los potenciales inquilinos. Nuestro objetivo es que vendas o arriendes tu propiedad de forma rápida, segura y al mejor valor.</p>",
        },
        {
          id: 3,
          question: "¿Cómo me asesoran si deseo comprar una propiedad?",
          answer:
            "<p>Para compradores, ofrecemos un acompañamiento completo. Nos reuniremos contigo para comprender qué tipo de propiedad necesitas (vivienda personal, inversión, etc.), tu presupuesto y preferencias. Con esos datos, buscamos proactivamente inmuebles que cumplan con tus criterios, ya sea dentro de nuestro portafolio o mediante nuestra red en el mercado. Te mostramos las propiedades, proporcionamos información detallada de cada una y resolvemos tus dudas. Cuando encuentres “esa” propiedad ideal, te apoyamos en la negociación del precio y condiciones, verificamos que la documentación esté en regla y te guamos en los trámites finales (firma de minuta, escritura pública, registros). Con Nexus Hub, comprar tu propiedad será un proceso claro y sin sorpresas, siempre velando por tus intereses.</p>",
        },
        {
          id: 4,
          question: "¿En qué consiste el servicio de saneamiento de propiedades?",
          answer:
            "<p>El saneamiento de propiedades es el proceso de regularizar la situación legal de un inmueble. Nuestro servicio de saneamiento físico-legal está diseñado para propietarios que necesitan poner en regla sus propiedades en cuanto a títulos, registros y documentación. Por ejemplo, te ayudamos en casos de herencias y sucesiones intestadas, subdivisiones o unificaciones de predios, inscripción de propiedades que nunca fueron registradas, rectificación de áreas y linderos, o cualquier otro trámite ante los Registros Públicos. Contamos con expertos legales en derecho inmobiliario que analizarán tu caso y gestionarán los trámites necesarios ante las entidades correspondientes, asegurando que tu propiedad quede totalmente saneada y libre de problemas legales. Esto te brinda la tranquilidad de tener un inmueble con papeles en orden, indispensable para vender, hipotecar o transmitir la propiedad sin inconvenientes.</p>",
        },
        {
          id: 5,
          question: "¿Cómo funcionan las comisiones o costos por sus servicios?",
          answer:
            "<p>Nuestras comisiones se manejan de forma transparente y acorde al estándar del mercado inmobiliario. En operaciones de compraventa, usualmente trabajamos con una comisión porcentual sobre el precio de venta final, la cual será acordada previamente contigo mediante contrato de corretaje. En el caso de alquileres, comúnmente cobramos al propietario una comisión equivalente a un mes de renta (por alquileres de un año) o un porcentaje del monto de renta, según lo que se estile en el mercado local. Importante: Todos estos detalles de honorarios se conversarán y pactarán antes de empezar a trabajar juntos, de modo que no haya sorpresas. Además, la asesoría inicial y publicación de tu propiedad pueden ser sin costo, cobrando solo si la operación se concreta – lo discutiremos en detalle según el servicio que requieras. Nuestro objetivo es que percibas el valor de nuestro trabajo y te sientas cómodo con los términos desde el inicio.</p>",
        },
        {
          id: 6,
          question: "¿En qué zonas operan sus servicios inmobiliarios?",
          answer:
            "<p>Actualmente, Nexus Hub Corporation centra sus operaciones en la ciudad de Trujillo, Perú, y sus alrededores dentro de la región La Libertad. Gracias a nuestro enfoque local, conocemos a fondo el mercado inmobiliario trujillano: desde los barrios residenciales tradicionales hasta las zonas de expansión urbana. Esto nos permite asesorarte con información precisa sobre cada distrito, valores de mercado actualizados y oportunidades en la zona. Si bien nuestro alcance principal es Trujillo (incluyendo distritos aledaños como Víctor Larco, Huanchaco, etc.), estamos abiertos a ayudarte en otras localidades a través de nuestra red de contactos inmobiliarios. Si necesitas asistencia fuera de nuestra zona de operación, con gusto te orientaremos o referiremos con aliados confiables. Tu mejor experiencia inmobiliaria es nuestro compromiso, dondequiera que esté tu próxima propiedad.</p>",
        },
        {
          id: 7,
          question: "¿Qué puedo hacer si tengo otra pregunta o necesito más información?",
          answer:
            "<p>Si tus dudas no han sido resueltas en esta sección de Preguntas Frecuentes, no te preocupes. Puedes contactarnos directamente a través de nuestros canales de comunicación (formulario, WhatsApp, email o teléfono) y con gusto atenderemos todas tus consultas adicionales. En Nexus Hub valoramos que estés bien informado: ninguna pregunta es demasiado simple o compleja, queremos que te sientas seguro en todo el proceso. Estamos aquí para ayudarte en lo que necesites, así que no dudes en escribirnos o llamarnos. ¡Estaremos encantados de asistirte!</p>",
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
        {faqData.map((faq, index) => (
          <FaqCard
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpenDefault={index === 0}
          />
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
