import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BG = '#09090E';
const ACCENT = '#BF00FF';

const SECTION_TITLES = {
  'pdf-kpis': 'Métricas Principales',
  'pdf-funnel': 'Embudo de Conversión',
  'pdf-goals': 'Objetivos y Comisión',
  'pdf-campaigns': 'Rendimiento de Campañas',
  'pdf-billing': 'Facturación',
  'pdf-history': 'Histórico Mes a Mes',
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function exportDashboardPdf({ clinicId, clinicName, periodLabel, sectionIds }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 40;

  // ---- Portada ----
  pdf.setFillColor(BG);
  pdf.rect(0, 0, pageW, pageH, 'F');

  try {
    const logo = await loadImage('/logo.png');
    const logoW = 150;
    const logoH = (logo.height / logo.width) * logoW;
    pdf.addImage(logo, 'PNG', margin, 90, logoW, logoH);
  } catch {
    /* logo opcional */
  }

  pdf.setTextColor('#8A8A9E');
  pdf.setFontSize(12);
  pdf.text('Agente Cualificador de Llamadas', margin, 200);

  pdf.setTextColor('#F0F0F8');
  pdf.setFontSize(24);
  pdf.text(clinicName, margin, 240, { maxWidth: pageW - margin * 2 });

  pdf.setFillColor(ACCENT);
  pdf.rect(margin, 260, 60, 3, 'F');

  pdf.setTextColor('#8A8A9E');
  pdf.setFontSize(12);
  pdf.text(`Periodo: ${periodLabel}`, margin, 300);
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  pdf.text(`Generado: ${fecha}`, margin, 320);

  pdf.setTextColor('#55556A');
  pdf.setFontSize(10);
  pdf.text('Enalia Digital · Informe de resultados', margin, pageH - margin);

  // ---- Páginas de contenido ----
  for (const id of sectionIds) {
    const node = document.getElementById(id);
    if (!node) continue;

    const canvas = await html2canvas(node, {
      backgroundColor: BG,
      scale: 2,
      logging: false,
      useCORS: true,
    });

    pdf.addPage();
    pdf.setFillColor(BG);
    pdf.rect(0, 0, pageW, pageH, 'F');

    pdf.setTextColor('#BF00FF');
    pdf.setFontSize(9);
    pdf.text((SECTION_TITLES[id] || '').toUpperCase(), margin, margin);

    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2 - 20;
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;

    pdf.addImage(canvas, 'PNG', margin, margin + 14, imgW, imgH);
  }

  const fileName = `implantologie-${clinicId}-2026-05.pdf`;
  pdf.save(fileName);
}
