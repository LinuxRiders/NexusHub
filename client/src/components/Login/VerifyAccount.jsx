import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import api from "../../api/api";

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados: 'loading', 'success', 'error'
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
        // Llamada al endpoint GET /auth/verify-account
        const response = await api  .get(
          `/auth/verify-account?token=${token}&email=${email}`
        );

        setStatus("success");
        setMessage(
          response.data.message || "¡Cuenta verificada correctamente!"
        );

        // Opcional: Redirigir automáticamente después de 3 segundos
        // setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.error || "El enlace ha expirado o no es válido."
        );
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress size={50} sx={{ mb: 3 }} />
            <Typography variant="h6">Verificando...</Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleOutlineIcon
              color="success"
              sx={{ fontSize: 60, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
              ¡Verificación Exitosa!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{ bgcolor: "#2563EB" }}
            >
              Iniciar Sesión
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
              Error de Verificación
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button variant="outlined" onClick={() => navigate("/login")}>
              Volver al Inicio
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyAccount;
