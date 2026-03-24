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
      // Opcional pero recomendado: Esto evita que AOS anime cosas
      // si estás viendo la página en una pantalla muy pequeña o vieja
      // once: true,
    });
  }, []);

  // 2. Creamos las reglas de cuándo ocultar las cosas
  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/perfil" ||
    location.pathname === "/admin";

  return (
    // 🔥 AQUÍ ESTÁ LA MAGIA: width: "100%", overflowX: "hidden"
    // Esto asegura que nada, ni AOS ni otra cosa, estire la página hacia los lados
    <div
      style={{ width: "100%", overflowX: "hidden", boxSizing: "border-box" }}
    >
      {/* 3. Renderizado condicional del NavBar */}
      <header>
        <NavBar
          barHeight="8dvh"
          pages={pages}
          sx={{ px: { xs: 1, md: "15.2%" } }}
        />
      </header>

      {/* Al main también le aseguramos el ancho exacto */}
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
