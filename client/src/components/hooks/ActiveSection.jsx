import { useEffect, useState } from "react";

/**
 * useActiveSection
 *
 * Detecta la sección activa (según el centro del viewport) usando offsets precalculados.
 * - Recalcula offsets automáticamente cuando cambia el tamaño de una sección (ResizeObserver).
 * - Recalcula / re-observa cuando se agregan o eliminan nodos relevantes (MutationObserver).
 *
 * @param {Array<{ to: string }>} pages  Array de páginas [{ label?, to }] donde `to` puede ser "/ruta#id".
 * @param {string} pathname              location.pathname (ruta actual, sin hash).
 * @param {Object} [options]             Opciones adicionales.
 * @param {HTMLElement} [options.root=document.body]  Elemento raíz a observar por mutations (opcional).
 *
 * @returns {string} activeRoute         Ruta activa: "pathname#id" o solo "pathname".
 */
export function useActiveSection(pages, pathname, options = {}) {
  const { root = document.body } = options;
  const [activeRoute, setActiveRoute] = useState(pathname);

  useEffect(() => {
    // 1) obtener los ids (hashes) correspondientes a la ruta actual o relativos
    const hashPages = pages
      .map((p) => p?.to?.split("#"))
      .filter(([path, hash]) => hash && (path === pathname || path === ""))
      .map(([path, hash]) => ({ path, hash }));

    if (hashPages.length === 0) {
      setActiveRoute(pathname);
      return;
    }

    // Helper: escapar id para querySelector (seguro)
    const escapeId = (id) => {
      try {
        if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(id);
      } catch (e) {}
      return id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\\/])/g, "\\$1");
    };

    // 2) función para (re)calcular offsets absolutos en documento
    let sectionOffsets = [];
    const computeOffsets = () =>
      hashPages
        .map(({ path, hash }) => {
          const el = document.getElementById(hash);
          if (!el) return null;
          // Usamos getBoundingClientRect solo en el momento de cálculo (no por scroll)
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY; // top absoluto en documento
          const bottom = rect.bottom + window.scrollY; // bottom absoluto en documento
          return { path, hash, top, bottom };
        })
        .filter(Boolean);

    sectionOffsets = computeOffsets();

    // 3) ResizeObserver: si una sección cambia de tamaño, recalcular offsets
    const resizeObserver = new ResizeObserver(() => {
      sectionOffsets = computeOffsets();
      // actualizar ruta activa inmediatamente
      handleScroll(); // schedule a rAF inside
    });

    // observar las secciones actuales
    const observeAllSections = () => {
      resizeObserver.disconnect(); // limpiar y re-observar
      for (const { hash } of hashPages) {
        const el = document.getElementById(hash);
        if (el) resizeObserver.observe(el);
      }
    };
    observeAllSections();

    // 4) MutationObserver: detectar añadidos / eliminados en el DOM que afecten a hashPages
    const mutationObserver = new MutationObserver((mutations) => {
      let relevant = false;

      // revisamos addedNodes y removedNodes buscando ids o descendientes con los ids
      for (const m of mutations) {
        if (m.type === "childList") {
          const checkNodeList = (nodeList) => {
            for (const node of nodeList) {
              if (node.nodeType !== 1) continue; // solo elementos
              // si el nodo contiene algún id relevante
              for (const { hash } of hashPages) {
                if (node.id === hash) return true;
                try {
                  if (node.querySelector(`#${escapeId(hash)}`)) return true;
                } catch (e) {
                  // en caso de id con caracteres raros, ignoramos error de selector
                }
              }
            }
            return false;
          };
          if (checkNodeList(m.addedNodes) || checkNodeList(m.removedNodes)) {
            relevant = true;
            break;
          }
        }
      }

      if (relevant) {
        // vuelvo a calcular offsets y re-observo los elementos presentes
        sectionOffsets = computeOffsets();
        observeAllSections();
        handleScroll();
      }
    });

    // Observamos el root (por defecto document.body). Puedes pasar otro root por options.
    mutationObserver.observe(root, { childList: true, subtree: true });

    // 5) handler de scroll (muy barato: compara números precalculados)
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        // const start = performance.now(); // inicio del timer
        const centerAbs = window.scrollY + window.innerHeight / 2;
        let activeSection = null;

        for (const { path, hash, top, bottom } of sectionOffsets) {
          if (top <= centerAbs && bottom >= centerAbs) {
            activeSection = { path, hash };
            break;
          }
        }

        setActiveRoute(
          activeSection
            ? `${activeSection.path}#${activeSection.hash}`
            : pathname
        );
        // const end = performance.now(); // fin del timer
        // console.log(`handleScroll ejecutado en ${(end - start).toFixed(3)} ms`);

        ticking = false;
      });
      ticking = true;
    };

    // 6) resize de ventana: recalcular offsets y re-observar (cambian rects)
    const onWindowResize = () => {
      sectionOffsets = computeOffsets();
      observeAllSections();
      handleScroll();
    };

    // inicializar
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", onWindowResize);

    // cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", onWindowResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, pages, root]);

  return activeRoute;
}
