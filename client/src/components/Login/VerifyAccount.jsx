import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// import api from "../../api/api";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Nuevas rutas solicitadas
import logo from "../../assets/img/logo2.png";
import bgBottom from "../../assets/img/MarcaAgua2.png";

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verificando tu cuenta...");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage("Enlace de verificación inválido o incompleto.");
        return;
      }

      try {
        // await api.get(`/auth/verify-account?token=${token}&email=${email}`);
        setTimeout(() => {
          setStatus("success");
          setMessage("¡Cuenta verificada correctamente!");
        }, 1500);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.error ||
            "El enlace ha expirado o no es válido.",
        );
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#2f3339",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* IMÁGENES DE FONDO DUPLICADAS */}
      {/* Imagen Izquierda (Muestra mitad Derecha visible) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: { xs: "20vh", sm: "40vh" }, // Responsive height
          width: { xs: "170px", sm: "340px" }, // Ancho visible (mitad)
          overflow: "hidden", // Recorte
          opacity: { xs: 0.1, sm: 0.25 }, // Responsive opacity
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Box
          component="img"
          src={bgBottom}
          alt="Fondo Ciudad Der"
          sx={{
            height: "100%",
            width: "200%", // Imagen completa tiene el doble de ancho que la ventana
            objectFit: "cover",
            transform: "translateX(-50%)", // Mueve la imagen para mostrar la mitad derecha (centro a derecha)
          }}
        />
      </Box>

      {/* Imagen Derecha (Muestra mitad Izquierda visible) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          height: { xs: "20vh", sm: "40vh" },
          width: { xs: "170px", sm: "340px" },
          overflow: "hidden",
          opacity: { xs: 0.1, sm: 0.25 },
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Box
          component="img"
          src={bgBottom}
          alt="Fondo Ciudad Izq"
          sx={{
            height: "100%",
            width: "200%",
            objectFit: "cover",
            transform: "translateX(0%)", // Mueve la imagen para mostrar la mitad izquierda
          }}
        />
      </Box>

      <Container
        maxWidth="sm"
        sx={{ position: "relative", zIndex: 1, pb: 6, pt: 6 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "340px",
            margin: "0 auto",
            textAlign: "center",
            color: "white",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: { xs: "1.6rem", sm: "2rem" },
              fontWeight: 800,
              color: "white",
              textAlign: "center",
              mb: 2,
            }}
          >
            Verificación de Cuenta
          </Typography>
          <Divider
            sx={{
              width: "100%",
              borderColor: "rgba(255, 255, 255, 0.3)",
              mb: 4,
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 4,
              width: "100%",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ width: "100%", maxWidth: "340px", objectFit: "contain" }}
            />
          </Box>

          {status === "loading" && (
            <>
              <CircularProgress size={50} sx={{ mb: 3, color: "white" }} />
              <Typography
                sx={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.2rem" }}
              >
                Verificando...
              </Typography>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircleOutlineIcon
                sx={{ fontSize: 60, mb: 2, color: "#4caf50" }}
              />
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                ¡Verificación Exitosa!
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  mb: 4,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {message}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  width: "100%",
                  py: 1.5,
                  bgcolor: "white",
                  color: "#2f3339",
                  borderRadius: 0,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#e0e0e0" },
                }}
              >
                INICIAR SESIÓN
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <ErrorOutlineIcon
                sx={{ fontSize: 60, mb: 2, color: "#ff5252" }}
              />
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                Error de Verificación
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  mb: 4,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {message}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  width: "100%",
                  py: 1.5,
                  color: "white",
                  borderColor: "white",
                  borderRadius: 0,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                VOLVER AL INICIO
              </Button>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default VerifyAccount;
