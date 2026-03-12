import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { MenuOpen, Close, Person } from "@mui/icons-material";
import { useEffect } from "react";
import { useRef } from "react";

// import logo from "../assets/logos.png";
import { useActiveSection } from "./hooks/ActiveSection";

const pages_base = [
  {
    title: "Inicio",
    classNames: ".Home",
    to: "/",
  },
  {
    title: "Nosotros",
    to: "/#aboutus",
  },
  {
    title: "Servicios",
    to: "/servicios",
  },
];

/**
 * Componente de barra de navegación responsivo con soporte para:
 *  - Sticky (se queda fijo al hacer scroll)
 *  - Detección de la sección activa según el scroll
 *  - Navegación por hash (#id) con scroll suave
 *  - Adaptación completa a dispositivos móviles
 */
function NavBar({ barHeight = "8vh", sx = {}, pages = pages_base }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /*------- STICKY FUNCTIONALITY ------ */
  const stickyRef = useRef(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSticky(!entry.isIntersecting);
      },
      { threshold: 1 }
    );

    if (stickyRef.current) observer.observe(stickyRef.current);
    return () => observer.disconnect();
  }, []);

  /*------- RUTA ACTUAL ------ */
  const location = useLocation();
  const goTo = useNavigate();

  /*------- SCROLL TO HASH ------ */
  const activeRoute = useActiveSection(pages, location.pathname);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;

    const element = document.getElementById(hash);
    if (!element) return;

    let isScrolling = true;
    let animationFrameId;

    const offset = window.innerHeight * 0.08; // 8vh
    const targetPosition =
      element.getBoundingClientRect().top + window.scrollY - offset;

    const start = window.scrollY;
    const distance = targetPosition - start;
    const duration = 1600;
    const startTime = performance.now();

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateScroll = (currentTime) => {
      if (!isScrolling) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1 && isScrolling) {
        animationFrameId = requestAnimationFrame(animateScroll);
      }
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    const cancelScroll = () => {
      if (isScrolling) {
        isScrolling = false;
        cancelAnimationFrame(animationFrameId);
      }
    };

    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchmove", cancelScroll, { passive: true });
    window.addEventListener("keydown", cancelScroll);

    return () => {
      isScrolling = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("wheel", cancelScroll);
      window.removeEventListener("touchmove", cancelScroll);
      window.removeEventListener("keydown", cancelScroll);
    };
  }, [location]);

  /*------- MENU CELULAR ------ */
  const [open, setOpen] = useState(false);
  const toggleMenu = () => {
    setOpen(!open);
  };

  // Cerrar menú al hacer clic en un enlace
  const handleMenuClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  // Handler para hacer scroll al inicio cuando se hace clic en "Inicio"
  const handleInicioClick = (e, pageTo) => {
    if (pageTo === "/" && location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      handleMenuClick();
    } else {
      handleMenuClick();
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "100vw",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Place Holder para detección de sticky */}
      <div ref={stickyRef} style={{ height: "0px" }} />

      {/* NavBar */}
      <Box
        component="nav"
        sx={{
          width: "100%",
          height: { xs: "60px", md: barHeight },
          position: "fixed",
          top: 0,
          zIndex: 100,
          display: "flex",
          textAlign: "center",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: "15px", sm: "25px", md: "40px" },
          transition: "all 0.3s ease-in-out",
          backgroundColor: sticky
            ? "var(--essential-background-color)"
            : "transparent",
          boxShadow: sticky ? "0 3px 10px rgba(0,0,0,0.1)" : "none",
          ...sx,
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            height: { xs: "50px", md: "70%" },
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* <img
            src={logo}
            alt="Logo"
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
              cursor: "pointer",
              filter: `
                invert(32%)
                sepia(88%)
                saturate(1020%)
                hue-rotate(178deg)
                brightness(72%)
                contrast(96%)
              `,
            }}
            onClick={() => goTo("/#home")}
          /> */}
        </Box>

        {/* Menú para pantallas grandes */}
        <Box
          component="nav"
          sx={{
            height: "fit-content",
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
            gap: { md: 2, lg: 3 },
            flexGrow: 0,
          }}
        >
          {pages.map((page, index) => (
            <Button
              key={index}
              disableRipple
              component={Link}
              to={page.to || ""}
              onClick={(e) => handleInicioClick(e, page.to)}
              sx={{
                textTransform: "uppercase",
                fontSize: { md: "0.85rem", lg: "0.95rem" },
                fontWeight: "600",
                transition: "all .3s ease",
                color:
                  activeRoute === page?.to
                    ? "var(--secondary-color)"
                    : "var(--text-secondary-color)",
                position: "relative",
                "&:hover": {
                  ...(activeRoute !== page?.to && {
                    color: "var(--secondary-color)",
                  }),
                  backgroundColor: "transparent",
                },
                // Indicador de página activa
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: activeRoute === page?.to ? "80%" : "0%",
                  height: "2px",
                  backgroundColor: "var(--secondary-color)",
                  transition: "width 0.3s ease",
                },
                "&:hover::after": {
                  width: "80%",
                },
              }}
            >
              {page.title}
            </Button>
          ))}

          {/* Botón de perfil/login */}
          <IconButton
            component={Link}
            to={"/login"}
            sx={{
              ml: 2,
              p: "8px",
              backgroundColor: "var(--primary-color)",
              color: "var(--text-primary-color)",
              transition: "all .3s ease-in-out",
              "&:hover": {
                backgroundColor: "var(--secondary-color)",
                transform: "scale(1.05)",
              },
            }}
          >
            <Person sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Botón de menú hamburguesa para móviles */}
        <IconButton
          color="inherit"
          aria-label="open menu"
          edge="end"
          onClick={toggleMenu}
          sx={{
            display: { xs: "flex", md: "none" },
            color: "var(--text-secondary-color)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          {open ? <Close fontSize="medium" /> : <MenuOpen fontSize="medium" />}
        </IconButton>
      </Box>

      {/* Overlay y Menú móvil */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 99,
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
        }}
        onClick={() => setOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: { xs: "80%", sm: "70%" },
            maxWidth: "400px",
            height: "100%",
            backgroundColor: "var(--essential-background-color)",
            boxShadow: "-2px 0 15px rgba(0, 0, 0, 0.2)",
            transform: open ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Encabezado del menú móvil */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.2rem 1rem",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
              backgroundColor: "var(--primary-color)",
              color: "white",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Menú
            </Typography>
            <IconButton
              onClick={toggleMenu}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Elementos del menú móvil */}
          <Box sx={{ padding: "1.5rem 0", flexGrow: 1 }}>
            {pages.map((page, index) => (
              <Button
                fullWidth
                component={Link}
                to={page.to}
                key={index}
                onClick={(e) => handleInicioClick(e, page.to)}
                sx={{
                  justifyContent: "flex-start",
                  padding: "1rem 1.5rem",
                  marginBottom: "0.5rem",
                  color:
                    activeRoute === page.to
                      ? "var(--secondary-color)"
                      : "var(--text-secondary-color)",
                  fontWeight: activeRoute === page.to ? "700" : "500",
                  fontSize: "1rem",
                  backgroundColor:
                    activeRoute === page.to
                      ? "rgba(0,0,0,0.05)"
                      : "transparent",
                  borderLeft:
                    activeRoute === page.to
                      ? "4px solid var(--secondary-color)"
                      : "4px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    paddingLeft: "2rem",
                  },
                }}
              >
                {page.title}
              </Button>
            ))}

            {/* Botón de login en móvil */}
            <Box sx={{ padding: "1rem 1.5rem", mt: 2 }}>
              <Button
                fullWidth
                component={Link}
                to="/login"
                variant="contained"
                startIcon={<Person />}
                onClick={handleMenuClick}
                sx={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  py: 1.2,
                  fontWeight: "600",
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "var(--secondary-color)",
                  },
                }}
              >
                Iniciar Sesión
              </Button>
            </Box>
          </Box>

          {/* Pie del menú móvil */}
          <Box
            sx={{
              padding: "1rem",
              borderTop: "1px solid rgba(0,0,0,0.1)",
              textAlign: "center",
              color: "white",
              backgroundColor: "var(--primary-color)",
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
              © {new Date().getFullYear()} CICASS
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default NavBar;
