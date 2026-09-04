import jsPDF from 'jspdf';
import { isNum, fmt, fmtEur, fmtPct, fmtDuracion, tasaAgendamiento, tasaAsistencia, tasaAgendamientoSobreContacto, comision } from './calc';

// Paleta del reporte — cohesive, alto contraste, siempre claro para impresión.
const COLORS = {
  bg: [255, 255, 255],
  ink: [26, 26, 46],
  secondary: [70, 70, 96],
  muted: [122, 122, 148],
  subtle: [180, 180, 200],
  hairline: [232, 232, 240],
  accent: [191, 0, 255],
  accentSoft: [246, 232, 255],
  accentBorder: [232, 200, 255],
  green: [39, 174, 132],
  greenSoft: [230, 246, 240],
  orange: [216, 138, 31],
  orangeSoft: [252, 242, 224],
  red: [220, 74, 74],
  bar: [240, 240, 246],
  card: [252, 252, 254],
};

function setFill(pdf, [r, g, b]) { pdf.setFillColor(r, g, b); }
function setStroke(pdf, [r, g, b]) { pdf.setDrawColor(r, g, b); }
function setText(pdf, [r, g, b]) { pdf.setTextColor(r, g, b); }

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ─── Componentes de dibujo reutilizables ───────────────────────────────

function drawPageFrame(pdf, { clinicName, periodLabel, pageNum, totalPages, isCover = false }) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Fondo blanco
  setFill(pdf, COLORS.bg);
  pdf.rect(0, 0, pageW, pageH, 'F');

  if (isCover) return;

  // Cabecera fina
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  setText(pdf, COLORS.subtle);
  pdf.text('ENALIA · INFORME', 40, 30);

  pdf.setFont('helvetica', 'bold');
  setText(pdf, COLORS.ink);
  pdf.text(clinicName.toUpperCase(), pageW - 40, 30, { align: 'right' });

  setStroke(pdf, COLORS.hairline);
  pdf.setLineWidth(0.5);
  pdf.line(40, 40, pageW - 40, 40);

  // Pie
  setText(pdf, COLORS.subtle);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(periodLabel, 40, pageH - 24);
  pdf.text(`${pageNum} / ${totalPages}`, pageW - 40, pageH - 24, { align: 'right' });
}

function drawSectionTitle(pdf, y, { eyebrow, title }) {
  const pageW = pdf.internal.pageSize.getWidth();

  setText(pdf, COLORS.accent);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text(eyebrow.toUpperCase(), 40, y);

  setFill(pdf, COLORS.accent);
  pdf.rect(40, y + 4, 24, 1.5, 'F');

  setText(pdf, COLORS.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(title, 40, y + 28);

  return y + 44;
}

// Tarjeta de KPI con label + valor grande + sub
function drawKpiCard(pdf, x, y, w, h, { label, value, sub, accent = false }) {
  setFill(pdf, accent ? COLORS.accentSoft : COLORS.card);
  setStroke(pdf, accent ? COLORS.accentBorder : COLORS.hairline);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(x, y, w, h, 6, 6, 'FD');

  setText(pdf, COLORS.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(label.toUpperCase(), x + 14, y + 20);

  setText(pdf, accent ? COLORS.accent : COLORS.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(value, x + 14, y + 46);

  if (sub) {
    setText(pdf, COLORS.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(sub, x + 14, y + 62, { maxWidth: w - 28 });
  }
}

// Fila para tabla comparativa (etiqueta + valor)
function drawKvRow(pdf, x, y, w, { label, value, valueColor = COLORS.ink }) {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  setText(pdf, COLORS.secondary);
  pdf.text(label, x, y);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  setText(pdf, valueColor);
  pdf.text(value, x + w, y, { align: 'right' });

  setStroke(pdf, COLORS.hairline);
  pdf.setLineWidth(0.4);
  pdf.line(x, y + 6, x + w, y + 6);

  return y + 20;
}

// Embudo horizontal (barras degradadas por longitud)
function drawFunnel(pdf, x, y, w, levels) {
  const maxVal = Math.max(...levels.filter((l) => isNum(l.value)).map((l) => l.value), 1);
  const rowH = 42;
  const gap = 8;

  levels.forEach((l, i) => {
    const rowY = y + i * (rowH + gap);
    // Etiqueta
    setText(pdf, COLORS.secondary);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(l.label, x, rowY + 14);

    // Valor a la derecha
    setText(pdf, COLORS.ink);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(isNum(l.value) ? fmt(l.value) : '—', x + w, rowY + 14, { align: 'right' });

    // Barra
    const barY = rowY + 22;
    setFill(pdf, COLORS.bar);
    pdf.roundedRect(x, barY, w, 10, 3, 3, 'F');

    if (isNum(l.value)) {
      const barW = Math.max(6, (l.value / maxVal) * w);
      setFill(pdf, l.color || COLORS.accent);
      pdf.roundedRect(x, barY, barW, 10, 3, 3, 'F');
    }
  });

  return y + levels.length * (rowH + gap);
}

// Barra objetivo vs actual
function drawGoalBar(pdf, x, y, w, { label, base, actual, unit = '%' }) {
  setText(pdf, COLORS.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(label, x, y);

  const maxScale = Math.max(base, isNum(actual) ? actual : 0) * 1.2 || 1;
  const basePct = base / maxScale;
  const actualPct = isNum(actual) ? Math.min(1, actual / maxScale) : 0;
  const ok = isNum(actual) && actual >= base;

  // Fila 1 — objetivo
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  setText(pdf, COLORS.muted);
  pdf.text('Objetivo', x, y + 20);

  setFill(pdf, COLORS.bar);
  pdf.roundedRect(x + 70, y + 12, w - 130, 8, 2.5, 2.5, 'F');
  setFill(pdf, COLORS.subtle);
  pdf.roundedRect(x + 70, y + 12, (w - 130) * basePct, 8, 2.5, 2.5, 'F');

  setText(pdf, COLORS.muted);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(`${fmt(base)}${unit}`, x + w, y + 20, { align: 'right' });

  // Fila 2 — actual
  setText(pdf, COLORS.accent);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Enalia', x, y + 40);

  setFill(pdf, COLORS.bar);
  pdf.roundedRect(x + 70, y + 32, w - 130, 8, 2.5, 2.5, 'F');
  setFill(pdf, ok ? COLORS.green : COLORS.orange);
  pdf.roundedRect(x + 70, y + 32, (w - 130) * actualPct, 8, 2.5, 2.5, 'F');

  setText(pdf, ok ? COLORS.green : COLORS.orange);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(isNum(actual) ? `${fmt(actual, 1)}${unit}` : '—', x + w, y + 40, { align: 'right' });

  return y + 56;
}

// ─── Páginas de contenido ──────────────────────────────────────────────

async function drawCover(pdf, { logo, clinicName, periodLabel, generatedAt }) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  setFill(pdf, COLORS.bg);
  pdf.rect(0, 0, pageW, pageH, 'F');

  // Banda superior sutil
  setFill(pdf, COLORS.accentSoft);
  pdf.rect(0, 0, pageW, 8, 'F');

  if (logo) {
    const logoW = 130;
    const logoH = (logo.height / logo.width) * logoW;
    pdf.addImage(logo, 'PNG', 40, 80, logoW, logoH);
  }

  setText(pdf, COLORS.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('INFORME DE RESULTADOS', 40, pageH * 0.42);

  setText(pdf, COLORS.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(34);
  pdf.text(clinicName, 40, pageH * 0.42 + 40, { maxWidth: pageW - 80 });

  setFill(pdf, COLORS.accent);
  pdf.rect(40, pageH * 0.42 + 54, 60, 3, 'F');

  setText(pdf, COLORS.secondary);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(periodLabel, 40, pageH * 0.42 + 82);

  setText(pdf, COLORS.muted);
  pdf.setFontSize(10);
  pdf.text(`Generado el ${generatedAt}`, 40, pageH * 0.42 + 100);

  // Pie de portada
  setStroke(pdf, COLORS.hairline);
  pdf.setLineWidth(0.5);
  pdf.line(40, pageH - 60, pageW - 40, pageH - 60);
  setText(pdf, COLORS.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Enalia Digital · Agente cualificador de llamadas', 40, pageH - 40);
  pdf.text('enaliadigital.com', pageW - 40, pageH - 40, { align: 'right' });
}

function drawExecutiveSummary(pdf, data, { clinicName, periodLabel, pageNum, totalPages }) {
  drawPageFrame(pdf, { clinicName, periodLabel, pageNum, totalPages });
  let y = drawSectionTitle(pdf, 68, { eyebrow: 'Resumen ejecutivo', title: 'Cómo va el mes' });

  const pageW = pdf.internal.pageSize.getWidth();
  const gutter = 40;
  const cardGap = 12;
  const cols = 3;
  const cardW = (pageW - gutter * 2 - cardGap * (cols - 1)) / cols;
  const cardH = 84;

  const m = data;
  const tAgend = tasaAgendamiento(m);
  const tAsist = tasaAsistencia(m);
  const tCont = tasaAgendamientoSobreContacto(m);

  // Fila 1 — 3 tarjetas principales
  drawKpiCard(pdf, gutter, y, cardW, cardH, {
    label: 'Leads', value: fmt(m.totalLeads),
    sub: `${fmt(m.leadsContactados)} contactados`,
  });
  drawKpiCard(pdf, gutter + (cardW + cardGap), y, cardW, cardH, {
    label: 'Citas agendadas', value: fmt(m.citasAgendadas), accent: true,
    sub: isNum(m.citasAsistidas) ? `${fmt(m.citasAsistidas)} asistidas` : 'Pendiente de confirmar',
  });
  drawKpiCard(pdf, gutter + (cardW + cardGap) * 2, y, cardW, cardH, {
    label: 'Tasa agendamiento', value: isNum(tAgend) ? `${fmt(tAgend, 1)}%` : '—',
    sub: 'sobre el total de leads',
  });
  y += cardH + cardGap;

  // Fila 2 — 3 tarjetas secundarias
  drawKpiCard(pdf, gutter, y, cardW, cardH, {
    label: 'Tasa asistencia', value: isNum(tAsist) ? `${fmt(tAsist, 1)}%` : '—',
    sub: 'de los agendados',
  });
  drawKpiCard(pdf, gutter + (cardW + cardGap), y, cardW, cardH, {
    label: 'Agendamiento / contactados', value: isNum(tCont) ? `${fmt(tCont, 1)}%` : '—',
    sub: 'sobre los que cogen',
  });
  drawKpiCard(pdf, gutter + (cardW + cardGap) * 2, y, cardW, cardH, {
    label: 'Tiempo respuesta', value: fmtDuracion(m.tiempoRespuestaSeg),
    sub: 'lead → primera llamada',
  });
  y += cardH + 24;

  // Bloque de takeaways
  setFill(pdf, COLORS.accentSoft);
  setStroke(pdf, COLORS.accentBorder);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(gutter, y, pageW - gutter * 2, 92, 8, 8, 'FD');

  setText(pdf, COLORS.accent);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('TITULARES DEL PERIODO', gutter + 16, y + 20);

  const bullets = [];
  if (isNum(tAgend)) bullets.push(`De cada 100 leads, ${Math.round(tAgend)} terminan con cita.`);
  if (isNum(m.leadsContactados) && m.totalLeads > 0) {
    const contactRate = (m.leadsContactados / m.totalLeads) * 100;
    bullets.push(`${Math.round(contactRate)}% de los leads cogen el teléfono.`);
  }
  if (isNum(m.tiempoRespuestaSeg)) {
    bullets.push(`Respondemos en ${fmtDuracion(m.tiempoRespuestaSeg)} desde que entra el lead.`);
  }

  setText(pdf, COLORS.ink);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  bullets.slice(0, 3).forEach((b, i) => {
    pdf.text(`•  ${b}`, gutter + 16, y + 40 + i * 16, { maxWidth: pageW - gutter * 2 - 32 });
  });
}

function drawMetricsPage(pdf, data, config, { clinicName, periodLabel, pageNum, totalPages }) {
  drawPageFrame(pdf, { clinicName, periodLabel, pageNum, totalPages });
  let y = drawSectionTitle(pdf, 68, { eyebrow: 'Métricas principales', title: 'Detalle operativo' });

  const pageW = pdf.internal.pageSize.getWidth();
  const gutter = 40;
  const colW = (pageW - gutter * 2 - 20) / 2;

  // Columna izquierda: métricas
  let leftY = y;
  const m = data;
  leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Leads totales', value: fmt(m.totalLeads) });
  leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Leads contactados', value: fmt(m.leadsContactados) });
  leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Citas agendadas', value: fmt(m.citasAgendadas), valueColor: COLORS.accent });
  leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Citas asistidas', value: isNum(m.citasAsistidas) ? fmt(m.citasAsistidas) : '—' });
  leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Total llamadas', value: fmt(m.totalLlamadas) });
  leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Intentos por lead', value: isNum(m.totalLlamadas) && m.totalLeads > 0 ? fmt(m.totalLlamadas / m.totalLeads, 1) : '—' });
  leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Tiempo de respuesta', value: fmtDuracion(m.tiempoRespuestaSeg) });
  if (isNum(m.valoracionMedia)) {
    leftY = drawKvRow(pdf, gutter, leftY, colW, { label: 'Valoración media', value: `${fmt(m.valoracionMedia, 1)} / 5` });
  }

  // Columna derecha: embudo
  setText(pdf, COLORS.muted);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('EMBUDO DE CONVERSIÓN', gutter + colW + 20, y);

  const funnelLevels = [
    { label: 'Leads', value: m.totalLeads, color: COLORS.accent },
    { label: 'Contactados', value: m.leadsContactados, color: [214, 130, 240] },
    { label: 'Agendados', value: m.citasAgendadas, color: [77, 143, 232] },
    { label: 'Asistidos', value: m.citasAsistidas, color: COLORS.green },
  ];
  drawFunnel(pdf, gutter + colW + 20, y + 16, colW, funnelLevels);
}

function drawGoalsPage(pdf, data, config, { clinicName, periodLabel, pageNum, totalPages }) {
  drawPageFrame(pdf, { clinicName, periodLabel, pageNum, totalPages });
  let y = drawSectionTitle(pdf, 68, { eyebrow: 'Objetivos y comisión', title: 'Antes vs ahora' });

  const pageW = pdf.internal.pageSize.getWidth();
  const gutter = 40;
  const w = pageW - gutter * 2;

  const tAgend = tasaAgendamiento(data);
  const tAsist = tasaAsistencia(data);
  const com = comision(data, config);

  y = drawGoalBar(pdf, gutter, y, w, {
    label: 'Tasa de agendamiento (citas / leads)',
    base: config.baseAgendamiento,
    actual: tAgend,
  }) + 20;

  y = drawGoalBar(pdf, gutter, y, w, {
    label: 'Tasa de asistencia (asistidas / agendadas)',
    base: config.baseAsistencia,
    actual: tAsist,
  }) + 28;

  // Bloque antes / ahora
  setFill(pdf, COLORS.card);
  setStroke(pdf, COLORS.hairline);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(gutter, y, w, 100, 8, 8, 'FD');

  const halfW = (w - 20) / 2;

  setText(pdf, COLORS.muted);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('ANTES', gutter + 16, y + 22);
  setText(pdf, COLORS.accent);
  pdf.text('AHORA CON ENALIA', gutter + 16 + halfW + 20, y + 22);

  setText(pdf, COLORS.secondary);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const baseAsistCount = Math.round((config.baseAgendamiento * config.baseAsistencia) / 100);
  pdf.text(
    `De cada 100 leads agendabas ${config.baseAgendamiento} y asistían ${baseAsistCount}.`,
    gutter + 16, y + 44, { maxWidth: halfW - 16 }
  );

  const nowAgend = isNum(tAgend) ? Math.round(tAgend) : null;
  const nowAsist = isNum(tAsist) ? Math.round(tAsist) : null;
  const asisAhora = isNum(nowAgend) && isNum(nowAsist) ? Math.round((nowAgend * nowAsist) / 100) : null;
  pdf.text(
    `De cada 100 leads agendas ${isNum(nowAgend) ? nowAgend : '—'} y asisten ${isNum(asisAhora) ? asisAhora : '—'}.`,
    gutter + 16 + halfW + 20, y + 44, { maxWidth: halfW - 16 }
  );

  y += 118;

  // Comisión
  if (isNum(com.comision)) {
    setFill(pdf, COLORS.accentSoft);
    setStroke(pdf, COLORS.accentBorder);
    pdf.roundedRect(gutter, y, w, 60, 8, 8, 'FD');

    setText(pdf, COLORS.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('COMISIÓN', gutter + 16, y + 22);

    setText(pdf, COLORS.ink);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`${fmt(com.citasExtra)} citas extra · ${config.feePorAsistida} € por cita`, gutter + 16, y + 42);

    setText(pdf, COLORS.accent);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(fmtEur(com.comision), gutter + w - 16, y + 38, { align: 'right' });
  }
}

function drawClinicRow(pdf, x, y, w, clinicName, m) {
  const tAgend = tasaAgendamiento(m);

  setFill(pdf, COLORS.card);
  setStroke(pdf, COLORS.hairline);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(x, y, w, 72, 6, 6, 'FD');

  setText(pdf, COLORS.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(clinicName, x + 14, y + 22);

  const colGap = (w - 28) / 4;
  const stats = [
    { label: 'Leads', value: fmt(m.totalLeads) },
    { label: 'Contactados', value: fmt(m.leadsContactados) },
    { label: 'Citas', value: fmt(m.citasAgendadas), accent: true },
    { label: 'Tasa agend.', value: isNum(tAgend) ? `${fmt(tAgend, 1)}%` : '—' },
  ];

  stats.forEach((s, i) => {
    const cx = x + 14 + i * colGap;
    setText(pdf, COLORS.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(s.label.toUpperCase(), cx, y + 44);

    setText(pdf, s.accent ? COLORS.accent : COLORS.ink);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text(s.value, cx, y + 62);
  });
}

function drawPerClinicPage(pdf, byClinic, { clinicName, periodLabel, pageNum, totalPages }) {
  drawPageFrame(pdf, { clinicName, periodLabel, pageNum, totalPages });
  let y = drawSectionTitle(pdf, 68, { eyebrow: 'Vista por clínica', title: 'Métricas clave por centro' });

  const pageW = pdf.internal.pageSize.getWidth();
  const gutter = 40;
  const w = pageW - gutter * 2;

  byClinic.forEach((c) => {
    drawClinicRow(pdf, gutter, y, w, c.name, c.data);
    y += 84;
  });
}

// ─── API pública ───────────────────────────────────────────────────────

export async function buildReport({
  clinicId, clinicName, periodLabel, data, config, byClinic, download = true, filename,
}) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const logo = await loadImage('/logo.png');
  const generatedAt = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const isGeneral = clinicId === 'general' && Array.isArray(byClinic) && byClinic.length > 0;

  // Estructura: portada + resumen + métricas + objetivos + (si general) por clínica
  const totalContentPages = 3 + (isGeneral ? 1 : 0);
  const totalPages = totalContentPages + 1; // portada
  let pageNum = 1;

  await drawCover(pdf, { logo, clinicName, periodLabel, generatedAt });

  pdf.addPage();
  pageNum += 1;
  drawExecutiveSummary(pdf, data, { clinicName, periodLabel, pageNum, totalPages });

  pdf.addPage();
  pageNum += 1;
  drawMetricsPage(pdf, data, config, { clinicName, periodLabel, pageNum, totalPages });

  pdf.addPage();
  pageNum += 1;
  drawGoalsPage(pdf, data, config, { clinicName, periodLabel, pageNum, totalPages });

  if (isGeneral) {
    pdf.addPage();
    pageNum += 1;
    drawPerClinicPage(pdf, byClinic, { clinicName, periodLabel, pageNum, totalPages });
  }

  if (download) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const file = filename || `enalia-${clinicId}-${yyyy}-${mm}.pdf`;
    pdf.save(file);
  }

  return pdf;
}

// API de compatibilidad con la firma anterior — ignora sectionIds y usa el nuevo layout.
export async function exportDashboardPdf({ clinicId, clinicName, periodLabel, data, config, byClinic }) {
  return buildReport({ clinicId, clinicName, periodLabel, data, config, byClinic });
}
