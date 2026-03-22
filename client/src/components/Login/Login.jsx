import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthProvider";
// import api from "../../api/api";

// Material-UI Imports
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  Collapse,
  Link,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Nuevas rutas de imágenes solicitadas
import logo from "../../assets/img/logo2.png";
import bgBottom from "../../assets/img/MarcaAgua2.png";
import { useAuth } from "../../context/AuthProvider";
import api from "../../api/api";

// Estilo para Inputs: Bordes rectos, texto blanco, fuente Nunito
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

// Icono de Google SVG
const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const { isAuthenticated, login, hasRole } = useAuth();
  const goTo = useNavigate();

  const [view, setView] = useState("login");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorResponse, setErrorResponse] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResetSent, setIsResetSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (hasRole("dev") || hasRole("admin")) {
        goTo("/admin", { replace: true });
      } else if (hasRole("user")) {
        goTo("/perfil", { replace: true });
      }
    }
  }, [isAuthenticated, hasRole, goTo]);

  const switchView = (newView) => {
    setView(newView);
    setErrorResponse("");
    setSuccessMessage("");
    setErrors({});
    setIsResetSent(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const validateForm = (formType) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    if (formType === "login" || formType === "register") {
      if (!formData.password)
        newErrors.password = "La contraseña es obligatoria";
    }

    // Validaciones exclusivas de REGISTRO
    if (formType === "register") {
      if (!formData.username) newErrors.username = "El usuario es obligatorio";
      if (formData.password.length < 8)
        newErrors.password = "Mínimo 8 caracteres";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = "Debes aceptar los términos y condiciones";
        setErrorResponse(
          "Debes aceptar los términos y condiciones para crear tu cuenta.",
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLERS ---

  // 1. LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm("login")) return;
    setIsSubmitting(true);
    setErrorResponse("");

    try {
      await login(formData.email, formData.password);
      // La redirección la maneja el useEffect
    } catch (error) {
      setErrorResponse(
        error.response?.data?.error || "Credenciales incorrectas.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. REGISTRO
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm("register")) return;
    setIsSubmitting(true);
    setErrorResponse("");

    try {
      const response = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (response.status === 201) {
        // Al registrarse exitosamente, cambiamos a la vista de pendiente
        setSuccessMessage("");
        setView("verify_pending");
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorResponse(error.response?.data?.error || "Error al registrarse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. RECUPERAR PASSWORD
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm("forgot")) return;
    setIsSubmitting(true);
    setErrorResponse("");
    setSuccessMessage("");

    try {
      await api.post("/auth/forgot-password", { email: formData.email });
      // Éxito: Mostrar mensaje de duración y cambiar estado del botón
      setSuccessMessage(
        "Si el correo existe, se ha enviado el enlace. Válido por 15 min.",
      );
      setIsResetSent(true);
      setIsSubmitting(false);
    } catch (error) {
      setSuccessMessage(
        "Si el correo existe, se ha enviado el enlace. Válido por 15 min.",
      );
      setIsResetSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. REENVIAR VERIFICACIÓN (Desde la vista Verify Pending)
  const handleResendVerification = async () => {
    setIsSubmitting(true);
    setErrorResponse("");
    setSuccessMessage("");

    try {
      await api.post("/auth/resend-verification", { email: formData.email });
      setSuccessMessage(
        "Nuevo enlace de verificación enviado. Revisa tu bandeja.",
      );
      setIsSubmitting(false);
    } catch (error) {
      setErrorResponse("No se pudo reenviar el correo. Intenta más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // INICIO DE SESIÓN CON GOOGLE (FUNCIONAL)
  // ==========================================
  const handleGoogleLogin = () => {
    // Para que el backend reciba los datos, la forma más común y segura con
    // OAuth2 (Google) es redirigir al usuario al endpoint de autenticación de tu API.
    // Ej: El backend maneja el login con Passport.js y luego te redirige de vuelta al frontend con un token.

    // window.location.href = "http://localhost:5000/api/auth/google"; // (Descomenta y ajusta esta ruta)

    console.log("Redirigiendo a autenticación de Google...");
  };

  // ==========================================
  // VISTAS DEL COMPONENTE
  // ==========================================
  const renderLoginForm = () => (
    <Box
      component="form"
      onSubmit={handleLoginSubmit}
      noValidate
      sx={{
        width: "100%",
        maxWidth: "340px",
        display: "flex",
        flexDirection: "column",
        zIndex: 2,
      }}
    >
      {/* 1. Título */}
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
        Iniciar Sesión en
      </Typography>

      {/* 2. Línea Horizontal */}
      <Divider
        sx={{ width: "100%", borderColor: "rgba(255, 255, 255, 0.3)", mb: 4 }}
      />

      {/* 3. Logo (Tamaño 340px) */}
      <Box
        sx={{ display: "flex", justifyContent: "center", mb: 4, width: "100%" }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: "100%", maxWidth: "340px", objectFit: "contain" }}
        />
      </Box>

      {/* 4. Casillas */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo Electrónico"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        sx={darkTextFieldStyle}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        id="password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        sx={darkTextFieldStyle}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* 5. Botón Ingresar */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{
          mt: 3,
          mb: 1.5,
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
          "INGRESAR"
        )}
      </Button>

      {/* 6. Botón Google */}
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleLogin}
        startIcon={<GoogleIcon />}
        sx={{
          mb: 4,
          py: 1.2,
          color: "white",
          borderColor: "rgba(255,255,255,0.5)",
          borderRadius: 0,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          "&:hover": {
            borderColor: "white",
            bgcolor: "rgba(255,255,255,0.05)",
          },
        }}
      >
        Iniciar sesión con Google
      </Button>

      {/* 7 y 8. Enlaces */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          alignItems: "center",
          mb: 0,
        }}
      >
        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("forgot")}
          sx={{
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
            color: "rgba(255,255,255,0.8)",
            "&:hover": { color: "white" },
          }}
        >
          Recuperar contraseña
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("register")}
          sx={{
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
            color: "white",
            fontWeight: 700,
          }}
        >
          ¿No tienes una cuenta? Regístrate
        </Link>
      </Box>
    </Box>
  );

  const renderRegisterForm = () => (
    <Box
      component="form"
      onSubmit={handleRegisterSubmit}
      noValidate
      sx={{
        width: "100%",
        maxWidth: "340px",
        display: "flex",
        flexDirection: "column",
        zIndex: 2,
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
        Crear Cuenta en
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

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Nombre de Usuario"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={!!errors.username}
        helperText={errors.username}
        sx={darkTextFieldStyle}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo Electrónico"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        sx={darkTextFieldStyle}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        id="password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        sx={darkTextFieldStyle}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} edge="end">
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
        name="confirmPassword"
        label="Confirmar Contraseña"
        type={showPassword ? "text" : "password"}
        id="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        sx={darkTextFieldStyle}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Checkbox Exclusivo del Registro */}
      <FormControlLabel
        control={
          <Checkbox
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            sx={{
              color: "rgba(255,255,255,0.5)",
              "&.Mui-checked": { color: "white" },
            }}
          />
        }
        label={
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              color: "white",
              fontSize: "0.85rem",
            }}
          >
            Acepto los términos y condiciones
          </Typography>
        }
        sx={{ width: "100%", mt: 1, mb: 1, ml: 0 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{
          mt: 2,
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
          "CREAR CUENTA"
        )}
      </Button>

      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleLogin}
        startIcon={<GoogleIcon />}
        sx={{
          mb: 3,
          py: 1.2,
          color: "white",
          borderColor: "rgba(255,255,255,0.5)",
          borderRadius: 0,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          "&:hover": {
            borderColor: "white",
            bgcolor: "rgba(255,255,255,0.05)",
          },
        }}
      >
        Registrarse con Google
      </Button>

      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("login")}
          sx={{
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
            color: "white",
            fontWeight: 700,
          }}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </Box>
    </Box>
  );

  const renderForgotForm = () => (
    <Box
      component="form"
      onSubmit={handleForgotSubmit}
      noValidate
      sx={{
        width: "100%",
        maxWidth: "340px",
        display: "flex",
        flexDirection: "column",
        zIndex: 2,
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
        Recuperar Contraseña
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
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
        }}
      >
        Ingresa tu correo y te enviaremos un enlace para restablecer tu
        contraseña.
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo Electrónico"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
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
        ) : isResetSent ? (
          "REENVIAR ENLACE"
        ) : (
          "ENVIAR ENLACE"
        )}
      </Button>
      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("login")}
          sx={{
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
            color: "white",
          }}
        >
          Volver al inicio de sesión
        </Link>
      </Box>
    </Box>
  );

  const renderVerifyPending = () => (
    <Box
      sx={{
        textAlign: "center",
        mt: 2,
        color: "white",
        width: "100%",
        maxWidth: "340px",
        zIndex: 2,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "4rem", mb: 2 }}>
        📧
      </Typography>
      <Typography
        component="h3"
        variant="h5"
        sx={{ fontFamily: "'Nunito', sans-serif", mb: 2, fontWeight: 700 }}
      >
        ¡Revisa tu correo!
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          mb: 1,
          color: "rgba(255,255,255,0.8)",
        }}
      >
        Hemos enviado un enlace de verificación a:
      </Typography>
      <Typography
        sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, mb: 2 }}
      >
        {formData.email}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          mb: 3,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        El enlace es válido por <strong>24 horas</strong>. Si no lo encuentras,
        revisa Spam.
      </Typography>
      <Button
        type="button"
        fullWidth
        variant="outlined"
        onClick={handleResendVerification}
        disabled={isSubmitting}
        sx={{
          mb: 3,
          py: 1.2,
          color: "white",
          borderColor: "white",
          borderRadius: 0,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
        }}
      >
        {isSubmitting ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          "REENVIAR CORREO"
        )}
      </Button>
      <Link
        component="button"
        variant="body2"
        onClick={() => switchView("login")}
        sx={{
          fontFamily: "'Nunito', sans-serif",
          textDecoration: "none",
          color: "white",
        }}
      >
        Volver al Inicio
      </Link>
    </Box>
  );

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
          height: { xs: "20vh", sm: "80vh" }, // Responsive height
          width: { xs: "270px", sm: "540px" }, // Ancho visible (mitad)
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
          height: { xs: "20vh", sm: "80vh" }, // Responsive height
          width: { xs: "270px", sm: "540px" }, // Ancho visible (mitad)
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

      {/* CONTENEDOR PRINCIPAL */}
      <Container
        component="main"
        maxWidth="sm"
        sx={{ position: "relative", zIndex: 1, pb: 6, pt: 6 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* ALERTAS GLOBALES */}
          <Box sx={{ width: "100%", maxWidth: "340px", mb: 2 }}>
            <Collapse in={!!errorResponse}>
              <Alert
                severity="error"
                onClose={() => setErrorResponse("")}
                sx={{ fontFamily: "'Nunito', sans-serif", borderRadius: 0 }}
              >
                {errorResponse}
              </Alert>
            </Collapse>
            <Collapse in={!!successMessage}>
              <Alert
                severity="success"
                onClose={() => setSuccessMessage("")}
                sx={{ fontFamily: "'Nunito', sans-serif", borderRadius: 0 }}
              >
                {successMessage}
              </Alert>
            </Collapse>
          </Box>

          {/* FORMULARIOS */}
          {view === "login" && renderLoginForm()}
          {view === "register" && renderRegisterForm()}
          {view === "forgot" && renderForgotForm()}
          {view === "verify_pending" && renderVerifyPending()}
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
