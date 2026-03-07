import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import api from "../../api/api";

// Material-UI Imports (Todo el UI viene de aquí)
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  Collapse,
  Link,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";

// Iconos (Opcional, para mejor UX en password)
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";

const Login = () => {
  const { isAuthenticated, login, hasRole } = useAuth();
  const goTo = useNavigate();

  // Estados de vista: 'login', 'register', 'forgot', 'verify_pending'
  const [view, setView] = useState("login");

  // Estado unificado del formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados de feedback visual
  const [errorResponse, setErrorResponse] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Estado para controlar si ya se envió el link de recuperación (para cambiar el texto del botón)
  const [isResetSent, setIsResetSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      hasRole("dev");
      if (hasRole("dev") || hasRole("admin")) {
        goTo("/admin", { replace: true });
      } else if (hasRole("user")) {
        goTo("/perfil", { replace: true });
      }
    }
  }, [isAuthenticated, hasRole, goTo]);

  // Limpiar estados al cambiar de vista
  const switchView = (newView) => {
    setView(newView);
    setErrorResponse("");
    setSuccessMessage("");
    setErrors({});
    setIsResetSent(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al escribir
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // --- VALIDACIONES ---
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

    if (formType === "register") {
      if (!formData.username) newErrors.username = "El usuario es obligatorio";
      if (formData.password.length < 8)
        newErrors.password = "Mínimo 8 caracteres";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
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
      const msg = error.response?.data?.error || "Credenciales incorrectas.";
      setErrorResponse(msg);
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
      }
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Error al registrarse. Intenta nuevamente.";
      setErrorResponse(msg);
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
        "Si el correo existe, se ha enviado el enlace. Válido por 15 min."
      );
      setIsResetSent(true);
    } catch (error) {
      // Por seguridad, mostramos el mismo mensaje aunque falle internamente (o manejas el error explícito si prefieres)
      setSuccessMessage(
        "Si el correo existe, se ha enviado el enlace. Válido por 15 min."
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
        "Nuevo enlace de verificación enviado. Revisa tu bandeja."
      );
    } catch (error) {
      setErrorResponse("No se pudo reenviar el correo. Intenta más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- COMPONENTES DE RENDERIZADO (VISTAS) ---

  const renderLoginForm = () => (
    <Box
      component="form"
      onSubmit={handleLoginSubmit}
      noValidate
      sx={{ mt: 1, width: "100%" }}
    >
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo Electrónico"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
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
          bgcolor: "#2563EB",
          fontWeight: "bold",
          "&:hover": { bgcolor: "#1e40af" },
        }}
      >
        {isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Ingresar"
        )}
      </Button>

      {/* LÍNEA DIVISORIA */}
      <Divider sx={{ my: 2, color: "text.secondary" }}>O</Divider>

      {/* ENLACES DEBAJO DE LA LÍNEA */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("forgot")}
          sx={{ textDecoration: "none", fontWeight: 500, color: "#2563EB" }}
        >
          ¿Olvidaste tu contraseña?
        </Link>

        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("register")}
          sx={{ textDecoration: "none", fontWeight: 500, color: "#2563EB" }}
        >
          ¿No tienes cuenta? Regístrate
        </Link>
      </Box>
    </Box>
  );

  const renderRegisterForm = () => (
    <Box
      component="form"
      onSubmit={handleRegisterSubmit}
      noValidate
      sx={{ mt: 1, width: "100%" }}
    >
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Nombre de Usuario"
        name="username"
        autoFocus
        value={formData.username}
        onChange={handleChange}
        error={!!errors.username}
        helperText={errors.username}
      />
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
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
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
        name="confirmPassword"
        label="Confirmar Contraseña"
        type={showPassword ? "text" : "password"}
        id="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
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
          bgcolor: "#2563EB",
          fontWeight: "bold",
          "&:hover": { bgcolor: "#1e40af" },
        }}
      >
        {isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Crear Cuenta"
        )}
      </Button>

      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("login")}
          sx={{ textDecoration: "none", fontWeight: 500, color: "#2563EB" }}
        >
          Volver al inicio de sesión
        </Link>
      </Box>
    </Box>
  );

  const renderForgotForm = () => (
    <Box
      component="form"
      onSubmit={handleForgotSubmit}
      noValidate
      sx={{ mt: 1, width: "100%" }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 2 }}
      >
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer
        tu contraseña.
      </Typography>

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
          bgcolor: "#2563EB",
          fontWeight: "bold",
          "&:hover": { bgcolor: "#1e40af" },
        }}
      >
        {isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : isResetSent ? (
          "Reenviar enlace de recuperación" // CAMBIO DE TEXTO AL ENVIAR
        ) : (
          "Enviar enlace"
        )}
      </Button>

      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => switchView("login")}
          sx={{ textDecoration: "none", fontWeight: 500, color: "#2563EB" }}
        >
          Volver al inicio de sesión
        </Link>
      </Box>
    </Box>
  );

  const renderVerifyPending = () => (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Typography variant="h1" sx={{ fontSize: "4rem", mb: 2 }}>
        📧
      </Typography>
      <Typography
        component="h3"
        variant="h5"
        sx={{ mb: 2, fontWeight: "bold", color: "#333" }}
      >
        ¡Revisa tu correo!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Hemos enviado un enlace de verificación a:
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: "bold", mb: 2, color: "#2563EB" }}
      >
        {formData.email}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        El enlace es válido por <strong>24 horas</strong>. Si no lo encuentras,
        revisa tu carpeta de Spam.
      </Typography>

      <Button
        type="button"
        fullWidth
        variant="outlined"
        onClick={handleResendVerification}
        disabled={isSubmitting}
        sx={{ mb: 3, borderColor: "#2563EB", color: "#2563EB" }}
      >
        {isSubmitting ? (
          <CircularProgress size={20} />
        ) : (
          "Reenviar correo de verificación"
        )}
      </Button>

      <Link
        component="button"
        variant="body2"
        onClick={() => switchView("login")}
        sx={{ textDecoration: "none", fontWeight: 500, color: "#2563EB" }}
      >
        Volver al Inicio
      </Link>
    </Box>
  );

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ height: "100vh", display: "flex", alignItems: "center" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          {/* HEADER CON TITULO E ICONO */}
          {view !== "verify_pending" && (
            <Box
              sx={{
                textAlign: "center",
                mb: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: "bold", mb: 1, color: "#1e3a8a" }}
              >
                {view === "login" && "Bienvenido"}
                {view === "register" && "Crear Cuenta"}
                {view === "forgot" && "Recuperar Contraseña"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {view === "login" && "Ingresa tus credenciales para acceder"}
                {view === "register" &&
                  "Únete a nuestra comunidad de profesionales"}
              </Typography>
            </Box>
          )}

          {/* ALERTAS DE ESTADO */}
          <Box sx={{ width: "100%", mb: 2 }}>
            <Collapse in={!!errorResponse}>
              <Alert
                severity="error"
                onClose={() => setErrorResponse("")}
                sx={{ fontSize: "0.85rem" }}
              >
                {errorResponse}
              </Alert>
            </Collapse>
            <Collapse in={!!successMessage}>
              <Alert
                severity="success"
                onClose={() => setSuccessMessage("")}
                sx={{ fontSize: "0.85rem" }}
              >
                {successMessage}
              </Alert>
            </Collapse>
          </Box>

          {/* RENDERIZADO DE VISTAS */}
          {view === "login" && renderLoginForm()}
          {view === "register" && renderRegisterForm()}
          {view === "forgot" && renderForgotForm()}
          {view === "verify_pending" && renderVerifyPending()}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
