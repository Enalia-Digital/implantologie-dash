import jsPDF from 'jspdf';
import { isNum, fmt, fmtEur, fmtDuracion, tasaAgendamiento, tasaAsistencia, tasaAgendamientoSobreContacto, comision } from './calc';

const C = {
  white: [255, 255, 255],
  ink: [24, 24, 42],
  secondary: [80, 80, 105],
  muted: [140, 140, 160],
  hairline: [225, 225, 235],
  accent: [191, 0, 255],
  accentLight: [240, 224, 255],
  green: [34, 168, 100],
  greenLight: [226, 245, 236],
  orange: [210, 130, 20],
  orangeLight: [252, 240, 218],
  cardBg: [250, 250, 254],
};

const fill = (p, c) => p.setFillColor(c[0], c[1], c[2]);
const stroke = (p, c) => p.setDrawColor(c[0], c[1], c[2]);
const text = (p, c) => p.setTextColor(c[0], c[1], c[2]);

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const PW = 595.28; // A4 pt width
const PH = 841.89; // A4 pt height
const M = 40;      // margin
const CW = PW - M * 2; // content width

// ─── Reusable primitives ──────────────────────────────────────────────

function header(pdf, { clinicName, periodLabel, pageNum, totalPages }) {
  fill(pdf, C.white);
  pdf.rect(0, 0, PW, PH, 'F');

  // Top accent line
  fill(pdf, C.accent);
  pdf.rect(0, 0, PW, 3, 'F');

  // Header row
  text(pdf, C.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(clinicName, M, 28);

  text(pdf, C.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(periodLabel, M, 40);
  pdf.text(`${pageNum} / ${totalPages}`, PW - M, 28, { align: 'right' });

  stroke(pdf, C.hairline);
  pdf.setLineWidth(0.5);
  pdf.line(M, 50, PW - M, 50);

  return 64;
}

function footer(pdf) {
  stroke(pdf, C.hairline);
  pdf.setLineWidth(0.4);
  pdf.line(M, PH - 50, PW - M, PH - 50);
  text(pdf, C.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text('Enalia Digital · enaliadigital.com', M, PH - 36);
}

function sectionLabel(pdf, y, label) {
  text(pdf, C.accent);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text(label.toUpperCase(), M, y);
  return y + 16;
}

function kpiBlock(pdf, x, y, w, h, { label, value, sub, accent }) {
  fill(pdf, C.cardBg);
  stroke(pdf, C.hairline);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, w, h, 5, 5, 'FD');

  if (accent) {
    fill(pdf, C.accent);
    pdf.rect(x, y, 3, h, 'F');
  }

  text(pdf, C.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text(label.toUpperCase(), x + 12, y + 16);

  text(pdf, accent ? C.accent : C.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(String(value), x + 12, y + 38);

  if (sub) {
    text(pdf, C.secondary);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text(sub, x + 12, y + 52);
  }

  return y + h;
}

function metricRow(pdf, x, y, w, label, value, valueColor) {
  stroke(pdf, [240, 240, 246]);
  pdf.setLineWidth(0.3);
  pdf.line(x, y + 18, x + w, y + 18);

  text(pdf, C.secondary);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(label, x, y + 12);

  text(pdf, valueColor || C.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(String(value), x + w, y + 12, { align: 'right' });

  return y + 22;
}

function funnelBar(pdf, x, y, w, maxVal, { label, value, color, pct }) {
  const barW = maxVal > 0 ? (value / maxVal) * (w - 90) : 0;

  text(pdf, C.secondary);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(label, x, y + 10);

  fill(pdf, [240, 240, 246]);
  pdf.roundedRect(x + 82, y + 2, w - 90, 10, 3, 3, 'F');

  if (barW > 0) {
    fill(pdf, color);
    pdf.roundedRect(x + 82, y + 2, Math.max(barW, 6), 10, 3, 3, 'F');
  }

  text(pdf, C.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  const display = isNum(value) ? fmt(value) : '—';
  pdf.text(display, x + w, y + 10, { align: 'right' });

  return y + 20;
}

function goalBar(pdf, x, y, w, { label, base, actual }) {
  text(pdf, C.secondary);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(label, x, y + 10);

  const barY = y + 18;
  const barH = 8;
  fill(pdf, [240, 240, 246]);
  pdf.roundedRect(x, barY, w, barH, 3, 3, 'F');

  if (isNum(actual) && actual > 0) {
    const pct = Math.min(actual / 100, 1);
    const ok = isNum(base) ? actual >= base : true;
    fill(pdf, ok ? C.green : C.orange);
    pdf.roundedRect(x, barY, w * pct, barH, 3, 3, 'F');
  }

  // Base marker
  if (isNum(base) && base > 0) {
    const bx = x + (base / 100) * w;
    stroke(pdf, C.muted);
    pdf.setLineWidth(0.8);
    pdf.line(bx, barY - 2, bx, barY + barH + 2);
    text(pdf, C.muted);
    pdf.setFontSize(6.5);
    pdf.text(`Base ${fmt(base, 0)}%`, bx + 3, barY - 2);
  }

  // Actual value
  text(pdf, C.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(isNum(actual) ? `${fmt(actual, 1)}%` : '—', x + w, y + 10, { align: 'right' });

  return barY + barH + 14;
}

// ─── Cover ────────────────────────────────────────────────────────────

async function drawCover(pdf, { logo, clinicName, periodLabel, generatedAt }) {
  fill(pdf, C.white);
  pdf.rect(0, 0, PW, PH, 'F');

  fill(pdf, C.accent);
  pdf.rect(0, 0, PW, 5, 'F');

  if (logo) {
    const lw = 110;
    const lh = (logo.height / logo.width) * lw;
    pdf.addImage(logo, 'PNG', M, 70, lw, lh);
  }

  text(pdf, C.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('INFORME DE RESULTADOS', M, PH * 0.38);

  text(pdf, C.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(30);
  pdf.text(clinicName, M, PH * 0.38 + 36, { maxWidth: CW });

  fill(pdf, C.accent);
  pdf.rect(M, PH * 0.38 + 48, 50, 2.5, 'F');

  text(pdf, C.secondary);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(periodLabel, M, PH * 0.38 + 74);

  text(pdf, C.muted);
  pdf.setFontSize(9);
  pdf.text(`Generado el ${generatedAt}`, M, PH * 0.38 + 92);

  // Footer
  stroke(pdf, C.hairline);
  pdf.setLineWidth(0.4);
  pdf.line(M, PH - 56, PW - M, PH - 56);
  text(pdf, C.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Enalia Digital · Agente cualificador de llamadas', M, PH - 38);
  pdf.text('enaliadigital.com', PW - M, PH - 38, { align: 'right' });
}

// ─── Main report page ─────────────────────────────────────────────────

function drawMainPage(pdf, data, ctx) {
  let y = header(pdf, ctx);
  const m = data;

  const tAgend = tasaAgendamiento(m);
  const tAsist = tasaAsistencia(m);
  const tCont = tasaAgendamientoSobreContacto(m);

  // KPI cards — 2 rows x 3
  y = sectionLabel(pdf, y, 'Resumen ejecutivo');

  const gap = 10;
  const cols = 3;
  const cardW = (CW - gap * (cols - 1)) / cols;
  const cardH = 58;

  const row1 = [
    { label: 'Leads', value: fmt(m.totalLeads), sub: `${fmt(m.leadsContactados)} contactados` },
    { label: 'Citas agendadas', value: fmt(m.citasAgendadas), sub: isNum(m.citasAsistidas) ? `${fmt(m.citasAsistidas)} asistidas` : '', accent: true },
    { label: 'Tiempo respuesta', value: fmtDuracion(m.tiempoRespuestaSeg), sub: 'lead → primera llamada' },
  ];
  row1.forEach((kpi, i) => {
    kpiBlock(pdf, M + i * (cardW + gap), y, cardW, cardH, kpi);
  });
  y += cardH + gap;

  const row2 = [
    { label: 'Tasa agendamiento', value: isNum(tAgend) ? `${fmt(tAgend, 1)}%` : '—', sub: 'sobre total de leads' },
    { label: 'Tasa asistencia', value: isNum(tAsist) ? `${fmt(tAsist, 1)}%` : '—', sub: 'de los agendados' },
    { label: 'Agend. / contactados', value: isNum(tCont) ? `${fmt(tCont, 1)}%` : '—', sub: 'sobre los que cogen' },
  ];
  row2.forEach((kpi, i) => {
    kpiBlock(pdf, M + i * (cardW + gap), y, cardW, cardH, kpi);
  });
  y += cardH + 20;

  // Two-column layout: left = detail metrics, right = funnel
  const colW = (CW - 24) / 2;

  // Left column — metrics detail
  let ly = sectionLabel(pdf, y, 'Detalle operativo');
  ly = metricRow(pdf, M, ly, colW, 'Leads totales', fmt(m.totalLeads));
  ly = metricRow(pdf, M, ly, colW, 'Leads contactados', fmt(m.leadsContactados));
  ly = metricRow(pdf, M, ly, colW, 'Citas agendadas', fmt(m.citasAgendadas), C.accent);
  ly = metricRow(pdf, M, ly, colW, 'Citas asistidas', isNum(m.citasAsistidas) ? fmt(m.citasAsistidas) : '—');
  ly = metricRow(pdf, M, ly, colW, 'Total llamadas', fmt(m.totalLlamadas));
  ly = metricRow(pdf, M, ly, colW, 'Intentos por lead', isNum(m.totalLlamadas) && m.totalLeads > 0 ? fmt(m.totalLlamadas / m.totalLeads, 1) : '—');
  ly = metricRow(pdf, M, ly, colW, 'Tiempo de respuesta', fmtDuracion(m.tiempoRespuestaSeg));
  if (isNum(m.valoracionMedia)) {
    ly = metricRow(pdf, M, ly, colW, 'Valoración media', `${fmt(m.valoracionMedia, 1)} / 5`);
  }

  // Right column — funnel
  const rx = M + colW + 24;
  let ry = sectionLabel(pdf, y, 'Embudo de conversión');

  const funnelData = [
    { label: 'Leads', value: m.totalLeads, color: C.accent },
    { label: 'Contactados', value: m.leadsContactados, color: [180, 100, 230] },
    { label: 'Agendados', value: m.citasAgendadas, color: [77, 143, 232] },
    { label: 'Asistidos', value: m.citasAsistidas, color: C.green },
  ];

  const maxFunnel = Math.max(...funnelData.map((f) => (isNum(f.value) ? f.value : 0)), 1);
  funnelData.forEach((f) => {
    ry = funnelBar(pdf, rx, ry, colW, maxFunnel, f);
  });

  // Takeaways box
  const bottomY = Math.max(ly, ry) + 14;
  fill(pdf, C.accentLight);
  stroke(pdf, [225, 200, 250]);
  pdf.setLineWidth(0.5);
  const boxH = 72;
  pdf.roundedRect(M, bottomY, CW, boxH, 6, 6, 'FD');

  text(pdf, C.accent);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('TITULARES DEL PERIODO', M + 14, bottomY + 16);

  const bullets = [];
  if (isNum(tAgend)) bullets.push(`De cada 100 leads, ${Math.round(tAgend)} terminan con cita.`);
  if (isNum(m.leadsContactados) && m.totalLeads > 0) {
    bullets.push(`${Math.round((m.leadsContactados / m.totalLeads) * 100)}% de los leads cogen el teléfono.`);
  }
  if (isNum(m.tiempoRespuestaSeg)) {
    bullets.push(`Respondemos en ${fmtDuracion(m.tiempoRespuestaSeg)} desde que entra el lead.`);
  }

  text(pdf, C.ink);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  bullets.slice(0, 3).forEach((b, i) => {
    pdf.text(`•  ${b}`, M + 14, bottomY + 32 + i * 14, { maxWidth: CW - 28 });
  });

  footer(pdf);
}

// ─── Goals + commission page ──────────────────────────────────────────

function drawGoalsPage(pdf, data, config, ctx) {
  let y = header(pdf, ctx);

  const tAgend = tasaAgendamiento(data);
  const tAsist = tasaAsistencia(data);
  const com = comision(data, config);

  y = sectionLabel(pdf, y, 'Objetivos');

  y = goalBar(pdf, M, y, CW, {
    label: 'Tasa de agendamiento (citas / leads)',
    base: config.baseAgendamiento,
    actual: tAgend,
  });
  y += 6;

  y = goalBar(pdf, M, y, CW, {
    label: 'Tasa de asistencia (asistidas / agendadas)',
    base: config.baseAsistencia,
    actual: tAsist,
  });
  y += 20;

  // Antes vs Ahora
  y = sectionLabel(pdf, y, 'Antes vs Ahora');

  fill(pdf, C.cardBg);
  stroke(pdf, C.hairline);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(M, y, CW, 80, 6, 6, 'FD');

  const halfW = (CW - 20) / 2;

  text(pdf, C.muted);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('ANTES', M + 14, y + 18);

  text(pdf, C.accent);
  pdf.text('AHORA CON ENALIA', M + 14 + halfW + 20, y + 18);

  text(pdf, C.secondary);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const baseAsistCount = Math.round((config.baseAgendamiento * config.baseAsistencia) / 100);
  pdf.text(
    `De cada 100 leads agendabas ${config.baseAgendamiento} y asistían ${baseAsistCount}.`,
    M + 14, y + 36, { maxWidth: halfW - 16 },
  );

  const nowAgend = isNum(tAgend) ? Math.round(tAgend) : null;
  const nowAsist = isNum(tAsist) ? Math.round(tAsist) : null;
  const asisAhora = isNum(nowAgend) && isNum(nowAsist) ? Math.round((nowAgend * nowAsist) / 100) : null;
  pdf.text(
    `De cada 100 leads agendas ${isNum(nowAgend) ? nowAgend : '—'} y asisten ${isNum(asisAhora) ? asisAhora : '—'}.`,
    M + 14 + halfW + 20, y + 36, { maxWidth: halfW - 16 },
  );

  y += 96;

  // Commission
  if (isNum(com.comision)) {
    y = sectionLabel(pdf, y, 'Comisión');

    fill(pdf, C.accentLight);
    stroke(pdf, [225, 200, 250]);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(M, y, CW, 50, 6, 6, 'FD');

    text(pdf, C.secondary);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`${fmt(com.citasExtra)} citas extra · ${config.feePorAsistida} € por cita`, M + 14, y + 22);

    text(pdf, C.accent);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(fmtEur(com.comision), M + CW - 14, y + 30, { align: 'right' });
  }

  footer(pdf);
}

// ─── Per-clinic page ──────────────────────────────────────────────────

function drawClinicRow(pdf, x, y, w, name, m) {
  const tAgend = tasaAgendamiento(m);

  fill(pdf, C.cardBg);
  stroke(pdf, C.hairline);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, w, 60, 5, 5, 'FD');

  text(pdf, C.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(name, x + 12, y + 18);

  const stats = [
    { label: 'Leads', value: fmt(m.totalLeads) },
    { label: 'Contactados', value: fmt(m.leadsContactados) },
    { label: 'Citas', value: fmt(m.citasAgendadas), accent: true },
    { label: 'Tasa', value: isNum(tAgend) ? `${fmt(tAgend, 1)}%` : '—' },
  ];

  const colGap = (w - 24) / stats.length;
  stats.forEach((s, i) => {
    const cx = x + 12 + i * colGap;
    text(pdf, C.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(s.label.toUpperCase(), cx, y + 36);

    text(pdf, s.accent ? C.accent : C.ink);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(String(s.value), cx, y + 52);
  });
}

function drawPerClinicPage(pdf, byClinic, ctx) {
  let y = header(pdf, ctx);
  y = sectionLabel(pdf, y, 'Métricas por clínica');

  byClinic.forEach((c) => {
    drawClinicRow(pdf, M, y, CW, c.name, c.data);
    y += 72;
  });

  footer(pdf);
}

// ─── Public API ───────────────────────────────────────────────────────

export async function buildReport({
  clinicId, clinicName, periodLabel, data, config, byClinic, download = true, filename,
}) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const logo = await loadImage('/logo.png');
  const generatedAt = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const isGeneral = clinicId === 'general' && Array.isArray(byClinic) && byClinic.length > 0;
  const totalPages = 3 + (isGeneral ? 1 : 0);
  let pageNum = 1;

  const ctx = (pn) => ({ clinicName, periodLabel, pageNum: pn, totalPages });

  await drawCover(pdf, { logo, clinicName, periodLabel, generatedAt });

  pdf.addPage();
  pageNum += 1;
  drawMainPage(pdf, data, ctx(pageNum));

  pdf.addPage();
  pageNum += 1;
  drawGoalsPage(pdf, data, config, ctx(pageNum));

  if (isGeneral) {
    pdf.addPage();
    pageNum += 1;
    drawPerClinicPage(pdf, byClinic, ctx(pageNum));
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

export async function exportDashboardPdf({ clinicId, clinicName, periodLabel, data, config, byClinic }) {
  return buildReport({ clinicId, clinicName, periodLabel, data, config, byClinic });
}
