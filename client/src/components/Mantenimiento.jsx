import "../styles/Mantenimiento.css";
import hexa from "../assets/hexa.png";

const Mantenimiento = () => {
  return (
    <div className="mainte">
      {/* https://codepen.io/zkreations/pen/VGWzYv */}
      <div className="wave">
        {/* Fondo Hexagonos */}
        <img
          src={hexa}
          alt="hexagonos"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            opacity: 0.2,
            WebkitMaskImage:
              "linear-gradient(to top, transparent 0%, #000 30%, #000 50%, transparent 80%)",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "cover",
            maskImage:
              "linear-gradient(to top, transparent 0%, #000 30%, #000 50%, transparent 80%)",
            maskRepeat: "no-repeat",
            maskSize: "cover",
          }}
        />
        <div className="wave-item"></div>
      </div>
    </div>
  );
};

export default Mantenimiento;
