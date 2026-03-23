// src/components/Admin/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaBuilding,
  FaEnvelope,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaFileContract,
  FaRegEye,
} from "react-icons/fa";
import "./AdminDashboard.css";
import api from "../../api/api"; // Added API

const AdminDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [dbUsers, setDbUsers] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, activityRes] = await Promise.all([
        api.get("/properties/admin/dashboard"),
        api.get("/users/stats?includeAdmins=false"), // Reutilizamos tu script optimizado
        api.get("/system/activity?limit=10"), // Nuevo motor de eventos
      ]);

      setStats(statsRes.data.data);
      setDbUsers(usersRes.data.data);
      setRecentActivity(activityRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const handleGenerateReportClick = (e) => {
    e.preventDefault();
    setModalConfig({
      isOpen: true,
      type: "confirm",
      message:
        "¿Deseas generar y descargar el reporte de rendimiento en formato CSV?",
    });
  };

  // ==========================================
  // FUNCIÓN LISTA PARA CONECTAR AL BACKEND
  // ==========================================
  const downloadReportAPI = async () => {
    // Aquí harás la llamada a tu API real en el futuro:
    // const response = await api.get('/admin/export-report', { responseType: 'blob' });
    // return response.data;

    // --- SIMULACIÓN DE RESPUESTA DEL BACKEND (Generamos un CSV en memoria) ---
    return new Promise((resolve) => {
      setTimeout(() => {
        // Contenido del archivo CSV simulado
        const csvContent = `Metrica,Valor\nUsuarios Totales,${stats.usuarios.total}\nInmuebles Activos,${stats.propiedades.total}\nNuevos mensajes,${stats.mensajes.total}\nOperaciones Cerradas,${stats.operaciones.total}\n\nActividad Reciente,Fecha\nNuevo usuario registrado: Juan Perez,Hoy\nLead entrante Av. Espana 123,Hoy\nOperacion Venta cerrada: Dpto. Victor Larco,Ayer`;

        // Convertimos el texto a un objeto Blob (archivo)
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        resolve(blob);
      }, 1500); // Simulamos 1.5 segundos de carga del servidor
    });
  };

  const confirmGenerateReport = async () => {
    setModalConfig({ ...modalConfig, isOpen: false });
    setIsGenerating(true);

    try {
      // 1. Solicitamos el archivo (Blob) al "Backend"
      const reportBlob = await downloadReportAPI();

      // 2. Lógica estándar de React/JS para descargar un archivo Blob
      const url = window.URL.createObjectURL(reportBlob);
      const link = document.createElement("a");
      link.href = url;

      // Nombre del archivo dinámico con la fecha actual
      const today = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `Reporte_NexusHub_${today}.csv`);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // 3. Mostramos éxito
      setModalConfig({
        isOpen: true,
        type: "success",
        message: "El reporte CSV se ha descargado correctamente en tu equipo.",
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error",
        message:
          "Ocurrió un error al intentar generar el reporte desde el servidor.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || !stats || !dbUsers)
    return <div className="admindash-container">Cargando métricas...</div>;

  return (
    <div className="admindash-container">
      {/* MODAL DEL SISTEMA */}
      {modalConfig.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type === "confirm" ? (
                <FaExclamationTriangle className="modal-icon confirm-icon" />
              ) : modalConfig.type === "error" ? (
                <FaExclamationTriangle
                  className="modal-icon error-icon"
                  style={{ color: "#dc2626" }}
                />
              ) : (
                <FaCheckCircle className="modal-icon success-icon" />
              )}
            </div>
            <h3 className="modal-title">
              {modalConfig.type === "confirm"
                ? "Confirmar Acción"
                : modalConfig.type === "error"
                  ? "Error"
                  : "¡Éxito!"}
            </h3>
            <p className="modal-message">{modalConfig.message}</p>
            <div className="modal-actions">
              {modalConfig.type === "confirm" && (
                <button
                  className="btn-modal btn-cancel"
                  onClick={() =>
                    setModalConfig({ ...modalConfig, isOpen: false })
                  }
                >
                  Cancelar
                </button>
              )}
              <button
                className="btn-modal btn-accept"
                onClick={
                  modalConfig.type === "confirm"
                    ? confirmGenerateReport
                    : () => setModalConfig({ ...modalConfig, isOpen: false })
                }
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DEL DASHBOARD */}
      <div className="admindash-header">
        <div className="admindash-title-group">
          <h1 className="admindash-title">Dashboard</h1>
          <h2 className="admindash-subtitle">
            Visión general del negocio inmobiliario
          </h2>
        </div>

        <button
          className={`btn-report ${isGenerating ? "disabled" : ""}`}
          onClick={handleGenerateReportClick}
          disabled={isGenerating}
        >
          <FaDownload className="btn-icon-small" />
          {isGenerating ? "Generando..." : "Descargar Reporte"}
        </button>
      </div>

      <div className="admindash-divider"></div>

      {/* GRID DE ESTADÍSTICAS PRINCIPALES */}
      <div className="admindash-stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-info">
              <span className="stat-label">Usuarios Totales</span>
              <span className="stat-value">{dbUsers?.totalUsers || 0}</span>
            </div>
            <div className="stat-icon-wrapper bg-blue">
              <FaUsers />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-period">
              Activos: <strong>{dbUsers?.activeUsers || 0}</strong> |
              Suspendidos: <strong>{dbUsers?.inactiveUsers || 0}</strong>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-info">
              <span className="stat-label">Inmuebles Activos</span>
              <span className="stat-value">{stats.propiedades.total}</span>
            </div>
            <div className="stat-icon-wrapper bg-corp">
              <FaBuilding />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span
              className={`stat-trend ${stats.propiedades.isUp ? "trend-up" : "trend-down"}`}
            >
              {stats.propiedades.isUp ? <FaArrowUp /> : <FaArrowDown />}{" "}
              {stats.propiedades.trend}
            </span>
            <span className="stat-period">vs mes anterior</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-info">
              <span className="stat-label">Nuevos mensajes</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-icon-wrapper bg-orange">
              <FaEnvelope />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-trend trend-down">
              <FaArrowDown /> 0%
            </span>
            <span className="stat-period">esta semana</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN SECUNDARIA COMPLEJA */}
      <div className="admindash-secondary-grid">
        {/* PANEL: TIMELINE DE ACTIVIDAD */}
        <div className="admindash-panel-box span-2">
          <div className="panel-box-header">
            <h3>
              <FaChartLine className="panel-icon" /> Actividad Reciente de la
              Plataforma
            </h3>
          </div>
          <div className="panel-box-content">
            <div className="timeline">
              {recentActivity.length === 0 ? (
                <p className="no-activity-msg">
                  No hay actividad reciente registrada en el sistema.
                </p>
              ) : (
                recentActivity.map((log) => {
                  let dotClass = "dot-corp";
                  let logText = "";

                  // Formatear el texto basado en el actionType agnóstico de la BD
                  switch (log.action_type) {
                    case "USER_REGISTERED":
                      dotClass = "dot-blue";
                      logText = (
                        <>
                          Nuevo usuario registrado:{" "}
                          <strong>{log.metadata?.name || "Desconocido"}</strong>{" "}
                          ({log.metadata?.email})
                        </>
                      );
                      break;
                    case "PROPERTY_FAVORITED":
                      dotClass = "dot-orange";
                      logText = (
                        <>
                          Propiedad{" "}
                          <strong>{log.metadata?.address || "N/A"}</strong>{" "}
                          guardada en favoritos por{" "}
                          {log.metadata?.user_name || "Alguien"}.
                        </>
                      );
                      break;
                    case "ALERT_MATCH_EMAIL_SENT":
                      dotClass = "dot-green";
                      logText = (
                        <>
                          Sistema originó notificación:{" "}
                          <strong>
                            {log.metadata?.notes || "Alerta Disparada"}
                          </strong>
                          .
                        </>
                      );
                      break;
                    default:
                      logText = <>{log.action_type}</>;
                  }

                  // Calcular tiempo transcurrido (soporte multiplataforma e internacional)
                  // Ya que la DB devuelve en UTC (con la Z), new Date() en JS lo convertirá
                  // de forma transparente y automática a la hora local exacta del país donde
                  // esté el navegador del usuario (sea Chile, Perú, España, etc).
                  const eventDate = new Date(log.created_at);
                  const mins = Math.floor((new Date() - eventDate) / 60000);
                  let timeLabel = "Hace un momento";
                  if (mins > 60 && mins < 1440)
                    timeLabel = `Hace ${Math.floor(mins / 60)} hora(s)`;
                  else if (mins >= 1440)
                    timeLabel = `Hace ${Math.floor(mins / 1440)} día(s)`;
                  else if (mins > 0) timeLabel = `Hace ${mins} min`;

                  return (
                    <div className="timeline-item" key={log.id}>
                      <div className={`timeline-dot ${dotClass}`}></div>
                      <div className="timeline-content">
                        <span className="timeline-time">{timeLabel}</span>
                        <p>{logText}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* TERCERA COLUMNA: BARRAS Y ACCIONES RÁPIDAS */}
        <div className="admindash-right-col">
          {/* PANEL: DISTRIBUCIÓN */}
          <div className="admindash-panel-box">
            <div className="panel-box-header">
              <h3>
                <FaBuilding className="panel-icon" /> Portafolio Actual
              </h3>
            </div>
            <div className="panel-box-content">
              <div className="progress-wrapper">
                <div className="progress-group">
                  <div className="progress-labels">
                    <span>En Venta</span>
                    <span className="txt-bold">
                      {stats.portfolio.ventas + stats.portfolio.alquileres > 0
                        ? Math.round(
                            (stats.portfolio.ventas /
                              (stats.portfolio.ventas +
                                stats.portfolio.alquileres)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill bg-corp"
                      style={{
                        width: `${stats.portfolio.ventas + stats.portfolio.alquileres > 0 ? Math.round((stats.portfolio.ventas / (stats.portfolio.ventas + stats.portfolio.alquileres)) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="progress-group">
                  <div className="progress-labels">
                    <span>En Alquiler</span>
                    <span className="txt-bold">
                      {stats.portfolio.ventas + stats.portfolio.alquileres > 0
                        ? Math.round(
                            (stats.portfolio.alquileres /
                              (stats.portfolio.ventas +
                                stats.portfolio.alquileres)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill bg-orange"
                      style={{
                        width: `${stats.portfolio.ventas + stats.portfolio.alquileres > 0 ? Math.round((stats.portfolio.alquileres / (stats.portfolio.ventas + stats.portfolio.alquileres)) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="tags-container mt-3">
                <span className="dash-tag">
                  Departamentos: {stats.portfolio.types?.departamentos || 0}
                </span>
                <span className="dash-tag">
                  Casas: {stats.portfolio.types?.casas || 0}
                </span>
                <span className="dash-tag">
                  Terrenos: {stats.portfolio.types?.terrenos || 0}
                </span>
                <span className="dash-tag">
                  Oficinas: {stats.portfolio.types?.oficinas || 0}
                </span>
              </div>
            </div>
          </div>

          {/* PANEL: ACCIONES RÁPIDAS */}
          <div className="admindash-panel-box">
            <div className="panel-box-header">
              <h3>Acciones Rápidas</h3>
            </div>
            <div className="panel-box-content action-buttons-container">
              <button
                className="btn-quick-action outline-corp"
                onClick={() => setActiveTab("inmuebles")}
              >
                <FaPlus /> Nuevo Inmueble
              </button>

              <button
                className="btn-quick-action outline-dark"
                onClick={() => setActiveTab("mensajes")}
              >
                <FaRegEye /> Ver mensajes Pendientes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
