// import Countdown from "../componentes/Home/Countdown";

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import FaqHero from "../components/Faq/FaqHero";
import FAQ from "../components/Faq/FAQ";

const Faq = () => {
  return (
    <div>
      {/*---------------------------------------------- FaqHero------------------------------------------*/}
      <header className="FaqHero">
        <FaqHero />
      </header>

      {/*----------------------------------------------   Propiedades  ------------------------------------------*/}
      <div
        id="FAQ"
        className="FAQ"
        style={{ marginTop: "110px", marginBottom: "100px" }}
      >
        <div>
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default Faq;
