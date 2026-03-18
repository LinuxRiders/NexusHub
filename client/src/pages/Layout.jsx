import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
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
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, []);

  return (
    <div>
      <ScrollToTop btn={false} />
      <header>
        <NavBar
          barHeight="8dvh"
          pages={pages}
          sx={{ px: { xs: 1, md: "15.2%" } }}
        />
      </header>
      <main style={{ maxWidth: "100vw" }}>
        <Outlet />
      </main>
      <footer id="footer" style={{ position: "relative" }}>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
