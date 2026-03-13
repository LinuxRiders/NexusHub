// import Countdown from "../componentes/Home/Countdown";

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import NosotrosHero from "../components/Nosotros/NosotrosHero";
import QuienesSomos from "../components/Nosotros/QuienesSomos";
import NuestrasEspecialidades from "../components/Nosotros/NuestrasEspecialidades";
import MisionVision from "../components/Nosotros/MisionVision";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      {/*---------------------------------------------- NosotrosHero ------------------------------------------*/}
      <header className="Nosotros">
        <NosotrosHero />
      </header>

      {/*----------------------------------------------   QuienesSomos  ------------------------------------------*/}
      <div id="QuienesSomos" className="QuienesSomos">
        <div>
          <QuienesSomos />
        </div>
      </div>
      {/*----------------------------------------------   NuestrasEspecialidades  ------------------------------------------*/}
      <div id="NuestrasEspecialidades" className="NuestrasEspecialidades">
        <div>
          <NuestrasEspecialidades />
        </div>
      </div>
      {/*----------------------------------------------   MisionVision  ------------------------------------------*/}
      <div id="MisionVision" className="MisionVision">
        <div>
          <MisionVision />
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
