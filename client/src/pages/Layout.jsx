import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const pages = [
  {
    title: "Inicio",
    to: "/",
  },
  {
    title: "Nosotros",
    to: "/nosotros",
  },
  {
    title: "Servicios",
    to: "/#servicios",
  },
  {
    title: "Propiedades",
    to: "/propiedades",
  },
];

const Layout = () => {
  // 1. Obtenemos la ruta actual
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, []);

  // 2. Creamos las reglas de cuándo ocultar las cosas
  // Cambia "/perfil" por la ruta exacta que uses para tu página de usuario
  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/perfil" ||
    location.pathname === "/admin";

  return (
    <div style={{ boxSizing: "border-box" }}>
      {/* 3. Renderizado condicional: Si NO debemos ocultar el NavBar, lo mostramos */}
      <header>
        <NavBar
          barHeight="8dvh"
          pages={pages}
          sx={{ px: { xs: 1, md: "15.2%" } }}
        />
      </header>

      <main style={{ width: "100%", boxSizing: "border-box" }}>
        <Outlet />
      </main>

      {/* 4. Renderizado condicional para el Footer */}
      {!hideFooter && (
        <footer id="footer" style={{ position: "relative" }}>
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default Layout;
