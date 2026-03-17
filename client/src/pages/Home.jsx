// import Countdown from "../componentes/Home/Countdown";
import Banner from "../components/Home/Banner";
import PropuestasValor from "../components/Home/PropuestasValor";
import QueEstasBuscando from "../components/Home/QueEstasBuscando";
import ServiciosAdicionales from "../components/Home/ServiciosAdicionales";
import UnPaso from "../components/Home/UnPaso";

const Home = () => {
  return (
    <div>
      {/*---------------------------------------------- BANNER------------------------------------------*/}
      <header className="Home">
        <Banner sx={{ px: { xs: 1, md: "15.2%" }, paddingTop: "8dvh" }} />
      </header>

      {/*----------------------------------------------   PropuestasValor  ------------------------------------------*/}
      <div id="PropuestasValor" className="PropuestasValor">
        <div>
          <PropuestasValor />
        </div>
      </div>
      {/*----------------------------------------------   QueEstasBuscando  ------------------------------------------*/}
      <div id="servicios" className="QueEstasBuscando">
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
    </div>
  );
};

export default Home;
