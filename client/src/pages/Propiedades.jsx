// import Countdown from "../componentes/Home/Countdown";

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import PropiedadesHero from "../components/Propiedades/PropiedadesHero";
import Property from "../components/Propiedades/Property";

const Propiedades = () => {
  return (
    <div>
      {/*---------------------------------------------- PropiedadesHero------------------------------------------*/}
      <header className="PropiedadesHero">
        <PropiedadesHero />
      </header>

      {/*----------------------------------------------   Propiedades  ------------------------------------------*/}
      <div id="Property" className="Property">
        <div>
          <Property />
        </div>
      </div>
    </div>
  );
};

export default Propiedades;
