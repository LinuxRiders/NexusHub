// import Countdown from "../componentes/Home/Countdown";

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import Hero from "../components/Home/Hero";
import PropuestasValor from "../components/Home/PropuestasValor";
import QueEstasBuscando from "../components/Home/QueEstasBuscando";
import ServiciosAdicionales from "../components/Home/ServiciosAdicionales";
import UnPaso from "../components/Home/UnPaso";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      {/*---------------------------------------------- BANNER------------------------------------------*/}
      <header className="Home">
        <Hero />
      </header>

      {/*----------------------------------------------   PropuestasValor  ------------------------------------------*/}
      <div id="PropuestasValor" className="PropuestasValor">
        <div>
          <PropuestasValor />
        </div>
      </div>
      {/*----------------------------------------------   QueEstasBuscando  ------------------------------------------*/}
      <div id="QueEstasBuscando" className="QueEstasBuscando">
        <div>
          <QueEstasBuscando />
        </div>
      </div>
      {/*----------------------------------------------   ServiciosAdicionales  ------------------------------------------*/}
      <div id="ServiciosAdicionales" className="ServiciosAdicionales">
        <div>
          <ServiciosAdicionales />
        </div>
      </div>
      {/*----------------------------------------------   UnPaso  ------------------------------------------*/}
      <div id="UnPaso" className="UnPaso">
        <div>
          <UnPaso />
        </div>
      </div>
      {/*----------------------------------------------   Footer prueba  ------------------------------------------*/}
      <div id="Footer" className="Footer">
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
