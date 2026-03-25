import React from "react";
import "./LegalContent.css";

const PoliticaCook = () => {
  return (
    <div className="legal-content-container">
      <h2 className="legal-content-title">Política de cookies</h2>

      <div className="legal-section">
        <p className="legal-paragraph">
          En el sitio web de Nexus Hub Corporation utilizamos cookies y
          tecnologías similares con el fin de mejorar la experiencia de
          navegación de nuestros usuarios, analizar el tráfico del sitio y
          brindar funciones personalizadas. Al visitar y continuar navegando en
          nuestro sitio, consideramos que aceptas el uso de cookies en las
          condiciones que se describen a continuación.
        </p>

        <h3 className="legal-subtitle">¿Qué son las cookies?</h3>
        <p className="legal-paragraph">
          Las cookies son pequeños archivos de texto que se almacenan en tu
          navegador o dispositivo cuando visitas un sitio web. Estas cookies
          recopilan información sobre tu actividad en la página web, como por
          ejemplo si ya has visitado el sitio con anterioridad, qué secciones
          consultaste, tus preferencias de idioma, entre otros datos. Las
          cookies no dañan tu dispositivo ni instalan software malicioso; su
          propósito principal es recordar cierta información útil para optimizar
          tu navegación.
        </p>

        <h3 className="legal-subtitle">
          ¿Para qué usamos cookies en Nexus Hub?
        </h3>
        <p className="legal-paragraph">
          Utilizamos cookies para múltiples propósitos legítimos y orientados a
          ofrecerte un mejor servicio:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Cookies técnicas o necesarias:</strong> Son esenciales para
            el funcionamiento de nuestra web. Por ejemplo, te permiten navegar
            por las secciones, cargar contenido rápidamente y recordar tus
            preferencias de privacidad (como el consentimiento de cookies). Sin
            estas cookies, algunas partes del sitio podrían no funcionar
            correctamente.
          </li>
          <li>
            <strong>Cookies de análisis y rendimiento:</strong> Nos ayudan a
            entender cómo los usuarios navegan por nuestro sitio, qué páginas
            son más visitadas, cuánto tiempo pasan en cada sección, etc.
            Utilizamos herramientas de terceros confiables (como Google
            Analytics u otros servicios similares) que instalan sus propias
            cookies para recopilar esta información de forma agregada y anónima.
            Gracias a estos datos estadísticos, podemos identificar qué estamos
            haciendo bien y qué podemos mejorar en la web, optimizando
            contenidos y funcionalidades.
          </li>
          <li>
            <strong>Cookies de funcionalidad y personalización:</strong>{" "}
            Permiten recordar tus preferencias para que la próxima vez que nos
            visites el sitio se adapte mejor a ti. Por ejemplo, pueden guardar
            el idioma seleccionado, la ciudad de preferencia para mostrarte
            propiedades relevantes u otros ajustes personalizados, de modo que
            no tengas que configurarlos cada vez. (Actualmente no usamos cookies
            de publicidad comportamental en nuestro sitio, es decir, no
            realizamos perfiles avanzados con tus datos de navegación para fines
            de marketing; de implementar algo similar en el futuro, te lo
            informaremos y solicitaremos el debido consentimiento.)
          </li>
        </ul>
        <p className="legal-paragraph">
          <strong>Cookies de terceros:</strong> Algunas cookies en nuestro sitio
          pueden ser colocadas por terceros con los que trabajamos. Por ejemplo,
          como mencionamos, usamos herramientas analíticas que colocan sus
          propias cookies para recopilar datos de navegación. También, al
          integrar contenido de redes sociales o mapas (por ejemplo, un mapa de
          Google Maps en la sección de contacto), esas plataformas pueden
          establecer sus cookies. Ten en cuenta que estas cookies de terceros se
          rigen por las políticas de dichos proveedores externos. En Nexus Hub
          solo colaboramos con terceros de confianza que cuentan con buenas
          prácticas de privacidad.
        </p>
        <p className="legal-paragraph">
          <strong>Consentimiento y configuración:</strong> Cuando ingresas por
          primera vez a nuestro sitio, se te informará a través de un banner o
          aviso sobre el uso de cookies, dándote la opción de aceptarlas o de
          obtener más información. Si decides continuar navegando sin
          personalizar tus preferencias de cookies, entenderemos que consientes
          el uso de las cookies según esta política. No obstante, en cualquier
          momento tienes la libertad de administrar o eliminar las cookies
          almacenadas en tu navegador. La mayoría de los navegadores (Chrome,
          Firefox, Safari, Edge, etc.) te permiten: ver qué cookies están
          activas, bloquear cookies de terceros o de sitios específicos,
          eliminar todas las cookies al cerrar el navegador, o incluso navegar
          en modo privado/incógnito donde las cookies se eliminan al terminar la
          sesión. Consulta la sección de ayuda de tu navegador para encontrar
          las instrucciones sobre cómo ajustar o deshabilitar las cookies. Ten
          en cuenta que, si bloqueas todas las cookies de nuestro sitio, es
          posible que algunas funcionalidades no operen al 100% (por ejemplo,
          puede que el sitio no recuerde tus preferencias o que ciertas
          secciones que dependen de cookies no se muestren correctamente).
        </p>

        <p className="legal-paragraph">
          <strong>Actualizaciones de la Política de Cookies:</strong> Podemos
          modificar esta política de cookies cuando sea necesario, ya sea por
          cambios en la legislación aplicable o por modificaciones en el uso de
          cookies de nuestro sitio. Te informaremos sobre cualquier cambio
          significativo publicando la versión actualizada en esta misma página.
          La fecha de la última actualización estará indicada al final del
          documento. Te recomendamos revisar periódicamente la Política de
          Cookies para estar al tanto de cómo utilizamos estas tecnologías.
        </p>
      </div>
    </div>
  );
};

export default PoliticaCook;
