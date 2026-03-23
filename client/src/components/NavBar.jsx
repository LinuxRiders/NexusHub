import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  MenuOpen,
  Close,
  Person,
  AccountCircleOutlined,
} from "@mui/icons-material";
import { useEffect } from "react";
import { useRef } from "react";

import logo from "../assets/img/logo2.png";
import { useActiveSection } from "./hooks/ActiveSection";
import { useAuth } from "../context/AuthProvider";

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
  const { isAuthenticated, user } = useAuth();

  /*------- STICKY FUNCTIONALITY ------ */
  const stickyRef = useRef(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSticky(!entry.isIntersecting);
      },
      { threshold: 1 },
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
          backgroundColor: sticky ? "var(--secondary-color)" : "transparent",
          boxShadow: sticky ? "0 3px 10px rgba(0,0,0,0.1)" : "none",
          ...sx,
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            height: { xs: "50px", md: "93%" },
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
              cursor: "pointer",
            }}
            onClick={(e) => {
              goTo("/");
              handleInicioClick(e, "/");
            }}
          />
        </Box>

        {/* Menú para pantallas grandes */}
        <Box
          component="nav"
          sx={{
            width: "74%",
            height: "100%",
            display: { xs: "none", md: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
            // gap: { md: 2, lg: 3 },
            flexGrow: 0,
            borderBottom: "2px solid #fdfdfda6",
            px: "1.5%",
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
                textTransform: "capitalize",
                fontSize: "1.1vw",
                fontWeight: "500",
                transition: "all .3s ease",
                color:
                  activeRoute === page?.to
                    ? "var(--text-primary-color)"
                    : "color-mix(in hsl, var(--text-primary-color), transparent 10%);",
                position: "relative",
                "&:hover": {
                  ...(activeRoute !== page?.to && {
                    color: "var(--text-primary-color)",
                  }),
                  backgroundColor: "transparent",
                },
              }}
            >
              {page.title}
            </Button>
          ))}

          {/* Botón de perfil/login */}
          <Button
            component={Link}
            to={isAuthenticated ? "/perfil" : "/login"}
            disableRipple
            sx={{
              height: "fit-content",
              width: "16%",
              py: 0.2,
              px: "1.2%",
              backgroundColor: "transparent",
              color: "var(--text-primary-color)",
              transition: "all .3s ease-in-out",
              "&:hover": {
                backgroundColor: "var(--essential-background-color)",
                color: "#256f8a",

                ".nvlogin-divider": {
                  backgroundColor: "#256f8a",
                },
              },
              border: "2px solid #fdfdfda6",
              borderRadius: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textTransform: "none",
            }}
          >
            <AccountCircleOutlined sx={{ fontSize: { md: 24, lg: 28 } }} />
            <Box
              sx={{
                width: "2px",
                alignSelf: "stretch",
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                className="nvlogin-divider"
                sx={{
                  height: "50%",
                  width: "100%",
                  backgroundColor: "#fdfdfda6",
                  transition: "all .3s ease-in-out",
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: isAuthenticated
                  ? { md: "0.9rem", lg: "1.05rem" }
                  : { md: "1.1rem", lg: "1.25rem" },
                fontWeight: isAuthenticated ? 600 : 400,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "110px",
              }}
            >
              {isAuthenticated
                ? user?.username || user?.nombres || "Perfil"
                : "Login"}
            </Typography>
          </Button>
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
                to={isAuthenticated ? "/perfil" : "/login"}
                variant="contained"
                startIcon={<Person />}
                onClick={handleMenuClick}
                sx={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  py: 1.2,
                  fontWeight: "600",
                  fontSize: isAuthenticated ? "0.9rem" : "1rem",
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "var(--secondary-color)",
                  },
                }}
              >
                {isAuthenticated
                  ? user?.username || user?.nombres || "Mi Perfil"
                  : "Iniciar Sesión"}
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
