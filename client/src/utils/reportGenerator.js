// src/utils/reportGenerator.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Función para traducir los eventos a texto legible
const formatLogText = (log) => {
  switch (log.action_type) {
    case "USER_REGISTERED":
      return `Nuevo usuario registrado: ${log.metadata?.name || "Desconocido"} (${log.metadata?.email})`;
    case "PROPERTY_FAVORITED":
      return `Propiedad ${log.metadata?.address || "N/A"} guardada en favoritos por ${log.metadata?.user_name || "Alguien"}.`;
    case "ALERT_MATCH_EMAIL_SENT":
      return `Sistema originó notificación: ${log.metadata?.notes || "Alerta Disparada"}.`;
    default:
      return log.action_type;
  }
};

export const downloadProfessionalReport = async (
  stats,
  dbUsers,
  recentActivity,
) => {
  // 1. Crear un nuevo libro de Excel nativo
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NexusHub Admin";
  workbook.created = new Date();

  // 2. Crear una hoja oculta las líneas de cuadrícula para un look más limpio
  const sheet = workbook.addWorksheet("Dashboard Gerencial", {
    views: [{ showGridLines: false }],
  });

  // 3. Definir anchos de columna perfectos
  sheet.columns = [
    { width: 5 }, // A (Espaciador izquierdo)
    { width: 35 }, // B (Métrica 1)
    { width: 22 }, // C (Valor 1)
    { width: 5 }, // D (Espaciador central)
    { width: 35 }, // E (Métrica 2)
    { width: 22 }, // F (Valor 2)
  ];

  // --- PALETA DE COLORES Y ESTILOS (CORREGIDO: argb en lugar de arg) ---
  const corpColor = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1C6A6E" },
  }; // Tu color corporativo
  const darkColor = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2F3339" },
  };
  const lightBg = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF9FAFB" },
  };

  const titleFont = {
    name: "Arial",
    size: 16,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  const sectionFont = {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  const labelFont = {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: "FF374151" },
  };
  const valueFont = {
    name: "Arial",
    size: 13,
    bold: true,
    color: { argb: "FF111827" },
  };

  const borderAll = {
    top: { style: "thin", color: { argb: "FFD1D5DB" } },
    left: { style: "thin", color: { argb: "FFD1D5DB" } },
    bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
    right: { style: "thin", color: { argb: "FFD1D5DB" } },
  };

  // ==========================================
  // CONSTRUCCIÓN DEL REPORTE
  // ==========================================

  sheet.addRow([]); // Fila 1: Espacio en blanco

  // Título Principal
  const titleRow = sheet.addRow([
    "",
    "REPORTE GERENCIAL - NEXUSHUB PLATAFORMA INMOBILIARIA",
  ]);
  sheet.mergeCells("B2:F2");
  titleRow.height = 45;
  titleRow.getCell(2).fill = corpColor;
  titleRow.getCell(2).font = titleFont;
  titleRow.getCell(2).alignment = { vertical: "middle", horizontal: "center" };

  // Fecha de Generación
  const dateRow = sheet.addRow([
    "",
    `Documento generado el: ${new Date().toLocaleString("es-ES")}`,
  ]);
  sheet.mergeCells("B3:F3");
  dateRow.getCell(2).font = {
    italic: true,
    color: { argb: "FF6B7280" },
    size: 10,
  };
  dateRow.getCell(2).alignment = { horizontal: "right", vertical: "middle" };

  sheet.addRow([]); // Fila 4 en blanco

  // --- SECCIÓN 1: USUARIOS E INMUEBLES ---
  const sec1Row = sheet.addRow([
    "",
    "1. COMUNIDAD Y USUARIOS",
    "",
    "",
    "2. PORTAFOLIO DE INMUEBLES",
  ]);
  sheet.mergeCells("B5:C5");
  sheet.mergeCells("E5:F5");
  sec1Row.height = 25;
  ["B", "E"].forEach((col) => {
    const cell = sheet.getCell(`${col}5`);
    cell.fill = darkColor;
    cell.font = sectionFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const dataRow1 = sheet.addRow([
    "",
    "Usuarios Totales Registrados",
    dbUsers?.totalUsers || 0,
    "",
    "Inmuebles Activos Totales",
    stats.propiedades?.total || 0,
  ]);
  const dataRow2 = sheet.addRow([
    "",
    "Cuentas Activas",
    dbUsers?.activeUsers || 0,
    "",
    "Inmuebles en Venta",
    stats.portfolio?.ventas || 0,
  ]);
  const dataRow3 = sheet.addRow([
    "",
    "Cuentas Suspendidas",
    dbUsers?.inactiveUsers || 0,
    "",
    "Inmuebles en Alquiler",
    stats.portfolio?.alquileres || 0,
  ]);

  // Aplicar estilos a las filas
  [dataRow1, dataRow2, dataRow3].forEach((row) => {
    row.height = 24;
    [2, 5].forEach((col) => {
      row.getCell(col).fill = lightBg;
      row.getCell(col).font = labelFont;
      row.getCell(col).border = borderAll;
      row.getCell(col).alignment = { vertical: "middle", indent: 1 };
    });
    [3, 6].forEach((col) => {
      row.getCell(col).font = valueFont;
      row.getCell(col).border = borderAll;
      row.getCell(col).alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  // Colores para estados
  dataRow2.getCell(3).font = { ...valueFont, color: { argb: "FF059669" } }; // Verde (Activos)
  dataRow3.getCell(3).font = { ...valueFont, color: { argb: "FFDC2626" } }; // Rojo (Suspendidos)

  sheet.addRow([]); // Espaciador

  // --- SECCIÓN 2: ATENCIÓN Y TIPOS ---
  const sec2Row = sheet.addRow([
    "",
    "3. ATENCIÓN AL CLIENTE",
    "",
    "",
    "4. DISTRIBUCIÓN POR TIPO",
  ]);
  const rIdx = sheet.rowCount;
  sheet.mergeCells(`B${rIdx}:C${rIdx}`);
  sheet.mergeCells(`E${rIdx}:F${rIdx}`);
  sec2Row.height = 25;
  ["B", "E"].forEach((col) => {
    const cell = sheet.getCell(`${col}${rIdx}`);
    cell.fill = darkColor;
    cell.font = sectionFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const dataRow4 = sheet.addRow([
    "",
    "Nuevos Mensajes (Semana)",
    stats.mensajes?.total || 0,
    "",
    "Departamentos",
    stats.portfolio?.types?.departamentos || 0,
  ]);
  const dataRow5 = sheet.addRow([
    "",
    "Tendencia de mensajes",
    stats.mensajes?.trend || "N/A",
    "",
    "Casas",
    stats.portfolio?.types?.casas || 0,
  ]);
  const dataRow6 = sheet.addRow([
    "",
    "Operaciones Cerradas",
    stats.operaciones?.total || 0,
    "",
    "Terrenos y Oficinas",
    (stats.portfolio?.types?.terrenos || 0) +
      (stats.portfolio?.types?.oficinas || 0),
  ]);

  [dataRow4, dataRow5, dataRow6].forEach((row) => {
    row.height = 24;
    [2, 5].forEach((col) => {
      row.getCell(col).fill = lightBg;
      row.getCell(col).font = labelFont;
      row.getCell(col).border = borderAll;
      row.getCell(col).alignment = { vertical: "middle", indent: 1 };
    });
    [3, 6].forEach((col) => {
      row.getCell(col).font = valueFont;
      row.getCell(col).border = borderAll;
      row.getCell(col).alignment = { vertical: "middle", horizontal: "center" };
    });
  });
  dataRow6.getCell(3).font = { ...valueFont, color: { argb: "FF059669" } }; // Verde

  sheet.addRow([]); // Espaciador

  // --- SECCIÓN 3: ACTIVIDAD RECIENTE ---
  const sec3Row = sheet.addRow([
    "",
    "5. REGISTRO DE ACTIVIDAD RECIENTE DEL SISTEMA",
  ]);
  const s3Idx = sheet.rowCount;
  sheet.mergeCells(`B${s3Idx}:F${s3Idx}`);
  sec3Row.height = 28;
  const sec3Cell = sheet.getCell(`B${s3Idx}`);
  sec3Cell.fill = corpColor;
  sec3Cell.font = sectionFont;
  sec3Cell.alignment = { vertical: "middle", horizontal: "center" };

  // Sub-header de la tabla
  const actHeaderRow = sheet.addRow([
    "",
    "Fecha y Hora",
    "",
    "Descripción del Evento",
  ]);
  const thIdx = sheet.rowCount;
  sheet.mergeCells(`B${thIdx}:C${thIdx}`);
  sheet.mergeCells(`D${thIdx}:F${thIdx}`);
  actHeaderRow.height = 20;
  ["B", "D"].forEach((col) => {
    const cell = sheet.getCell(`${col}${thIdx}`);
    cell.fill = darkColor;
    cell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.border = borderAll;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Datos de Actividad
  if (recentActivity && recentActivity.length > 0) {
    recentActivity.forEach((log) => {
      const row = sheet.addRow([
        "",
        new Date(log.created_at).toLocaleString("es-ES"),
        "",
        formatLogText(log),
      ]);
      const cIdx = sheet.rowCount;
      sheet.mergeCells(`B${cIdx}:C${cIdx}`);
      sheet.mergeCells(`D${cIdx}:F${cIdx}`);

      row.getCell(2).border = borderAll;
      row.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
      row.getCell(2).font = { color: { argb: "FF4B5563" } };

      row.getCell(4).border = borderAll;
      row.getCell(4).alignment = {
        vertical: "middle",
        indent: 1,
        wrapText: true,
      };
      row.getCell(4).font = { color: { argb: "FF111827" } };
      row.height = 30; // Más alto para que entre el texto
    });
  } else {
    const row = sheet.addRow([
      "",
      "No hay actividad reciente registrada en la plataforma.",
    ]);
    sheet.mergeCells(`B${sheet.rowCount}:F${sheet.rowCount}`);
    row.getCell(2).border = borderAll;
    row.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(2).font = { italic: true, color: { argb: "FF9CA3AF" } };
  }

  sheet.addRow([]);
  const footerRow = sheet.addRow([
    "",
    "Reporte Confidencial - Propiedad de NexusHub",
  ]);
  sheet.mergeCells(`B${sheet.rowCount}:F${sheet.rowCount}`);
  footerRow.getCell(2).font = { size: 9, color: { argb: "FF9CA3AF" } };
  footerRow.getCell(2).alignment = { horizontal: "center" };

  // ==========================================
  // GENERAR Y DESCARGAR EL ARCHIVO NATIVO
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const dateStr = new Date().toISOString().split("T")[0];
  saveAs(blob, `Reporte_Gerencial_${dateStr}.xlsx`);
};
