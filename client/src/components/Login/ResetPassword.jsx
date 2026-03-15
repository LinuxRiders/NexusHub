import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// import api from "../../api/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockResetIcon from "@mui/icons-material/LockReset";

// Nuevas rutas solicitadas
import logo from "../../assets/img/logo2.png";
import bgBottom from "../../assets/img/MarcaAgua2.png";

const darkTextFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    borderRadius: 0,
    fontFamily: "'Nunito', sans-serif",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
    "&:hover fieldset": { borderColor: "white" },
    "&.Mui-focused fieldset": { borderColor: "white", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "'Nunito', sans-serif",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
  "& .MuiIconButton-root": { color: "white" },
  "& .MuiFormHelperText-root": {
    color: "#ff8a80",
    fontFamily: "'Nunito', sans-serif",
  },
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!password || password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres.";
    if (password !== confirmPassword) return "Las contraseñas no coinciden.";
    if (!token || !email) return "Token inválido. Solicita un nuevo enlace.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      // await api.post("/auth/reset-password", { token, email, newPassword: password });
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.error || "El enlace ha expirado o es inválido.",
      );
      setIsSubmitting(false);
    }
  };

  // Layout base (Fondo oscuro + imágenes duplicadas)
  const renderLayout = (children) => (
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
            transform: "translateX(0%)", // Muestra la mitad izquierda
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
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );

  if (success) {
    return renderLayout(
      <Box
        sx={{ textAlign: "center", color: "white", width: "100%", zIndex: 2 }}
      >
        <LockResetIcon sx={{ fontSize: 60, mb: 2, color: "#4caf50" }} />
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
        >
          ¡Contraseña Restablecida!
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            mb: 4,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Tu contraseña ha sido actualizada correctamente.
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
          IR A INICIAR SESIÓN
        </Button>
      </Box>,
    );
  }

  return renderLayout(
    <>
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
        Nueva Contraseña
      </Typography>
      <Divider
        sx={{ width: "100%", borderColor: "rgba(255, 255, 255, 0.3)", mb: 4 }}
      />
      <Box
        sx={{ display: "flex", justifyContent: "center", mb: 4, width: "100%" }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: "100%", maxWidth: "340px", objectFit: "contain" }}
        />
      </Box>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          mb: 3,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
        }}
      >
        Ingresa tu nueva contraseña para recuperar el acceso.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            mb: 2,
            borderRadius: 0,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Nueva Contraseña"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={darkTextFieldStyle}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Confirmar Contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={darkTextFieldStyle}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            bgcolor: "white",
            color: "#2f3339",
            borderRadius: 0,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            "&:hover": { bgcolor: "#e0e0e0" },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "CAMBIAR CONTRASEÑA"
          )}
        </Button>
      </Box>
    </>,
  );
};

export default ResetPassword;
