import { RampRight } from "@mui/icons-material";
import { SpeedDial } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ btn = false }) => {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(true);
  const scrollingRef = useRef(false); // indica si hay scroll animado
  const animationRef = useRef(null); // referencia al requestAnimationFrame

  const scrollTop = useCallback(() => {
    scrollingRef.current = true;

    const start = window.scrollY;
    const duration = 800; // milisegundos
    const startTime = performance.now();

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const newY = start * (1 - eased);

      window.scrollTo(0, newY);

      if (progress < 1 && scrollingRef.current) {
        animationRef.current = requestAnimationFrame(animateScroll);
      } else {
        scrollingRef.current = false;
        cancelAnimationFrame(animationRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(animateScroll);
  }, []);

  // Si el usuario hace scroll manual, cancelar animación
  useEffect(() => {
    const handleUserScroll = () => {
      if (scrollingRef.current) {
        scrollingRef.current = false;
        cancelAnimationFrame(animationRef.current);
      }
    };

    window.addEventListener("wheel", handleUserScroll, { passive: true });
    window.addEventListener("touchmove", handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleUserScroll);
      window.removeEventListener("touchmove", handleUserScroll);
    };
  }, []);

  // Mostrar / ocultar el botón según la posición
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setHidden(!(window.scrollY >= window.innerHeight));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset al cambiar de ruta
  useEffect(() => {
    scrollTop();
  }, [pathname, scrollTop]);

  if (!btn) return null;

  return (
    <SpeedDial
      ariaLabel="scroll-to-top"
      sx={{
        position: "fixed",
        bottom: 40,
        right: 40,
        transition: "all .3s ease-in-out",

        "& .MuiFab-primary": {
          bgcolor: "var(--secondary-color)",
          transition: "all .3s ease-in-out",

          "&:hover": {
            bgcolor: "var(--primary-color)",
          },
          "&:hover .scrollTop-icon": {
            color: "var(--text-primary-color)",
          },
        },
      }}
      icon={
        <RampRight
          className="scrollTop-icon"
          sx={{
            fontWeight: "bold",
            fontSize: "2.5rem",
            padding: "0px",
            color: "var(--text-primary-color)",
            transition: "all .3s ease-in-out",
          }}
        />
      }
      hidden={hidden}
      onClick={scrollTop}
    />
  );
};

export default ScrollToTop;
