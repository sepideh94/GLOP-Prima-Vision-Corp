import { jsPDF } from "jspdf";

const CHART_TITLES = [
  "Répartition des acteurs (connexions par rôle)",
  "Pics d'affluence — trafic horaire",
  "Fréquentation — connexions par jour",
  "Durée moyenne de session par rôle",
  "Sections les plus consultées",
];

function chartPagesCount(n) {
  if (n <= 0) return 0;
  return Math.ceil(n / 2);
}

/** Page 1 = synthèse, puis pages graphiques */
function annexPageRangeLabel(chartCount) {
  const c = chartPagesCount(chartCount);
  if (c === 0) return "—";
  const start = 2;
  const end = 1 + c;
  return start === end ? `p. ${start}` : `p. ${start}–${end}`;
}

const C = {
  ink: [15, 23, 42],
  slate700: [51, 65, 85],
  slate500: [100, 116, 139],
  slate400: [148, 163, 184],
  slate200: [226, 232, 240],
  slate50: [248, 250, 252],
  cyan: [34, 211, 238],
  blue: [59, 130, 246],
  violet: [139, 92, 246],
  green: [34, 197, 94],
  amber: [245, 158, 11],
};

function setFill(doc, rgb) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setText(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function setDraw(doc, rgb) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

/** Pied de page : bandeau discret + marque + pagination */
function drawFooter(doc, pageIndex, totalPages, variant = "light") {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 14;
  setFill(doc, C.cyan);
  doc.rect(0, H - 12.5, W, 0.55, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  if (variant === "dark") {
    setText(doc, C.slate400);
  } else {
    setText(doc, C.slate500);
  }
  doc.text("CiblOrgaSport · Usage interne — ne pas diffuser", m, H - 5.5);
  doc.setFont("helvetica", "bold");
  setText(doc, variant === "dark" ? [255, 255, 255] : C.ink);
  doc.text(`${pageIndex} / ${totalPages}`, W - m, H - 5.5, { align: "right" });
}

function drawSectionRule(doc, W, M, y, num, title) {
  setText(doc, C.cyan);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(num, M, y);
  setText(doc, C.ink);
  doc.setFontSize(12);
  doc.text(title, M + 14, y);
  setDraw(doc, C.slate200);
  doc.setLineWidth(0.4);
  doc.line(M, y + 4, W - M, y + 4);
  return y + 14;
}

function drawKpiCard(doc, x, y, w, h, label, value, accentRgb) {
  setFill(doc, C.slate50);
  setDraw(doc, C.slate200);
  doc.setLineWidth(0.25);
  doc.rect(x, y, w, h, "FD");
  setFill(doc, accentRgb);
  doc.rect(x, y, 3.2, h, "F");
  setText(doc, C.slate500);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(label.toUpperCase(), x + 6, y + 9);
  setText(doc, C.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(String(value), x + 6, y + 19);
}

/**
 * @param {object} params
 * @param {object|null} params.stats
 * @param {number} params.days
 * @param {string} params.summary
 * @param {string[]} params.chartDataUrls
 */
export function saveDashboardPdf({ stats, days, summary, chartDataUrls }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const contentW = W - 2 * M;
  const FOOT = 14;

  const rate = stats?.incidentResolutionRate ?? 0;

  // ——— Page 1 : sommaire + KPI (sans couverture) ———
  setFill(doc, [255, 255, 255]);
  doc.rect(0, 0, W, H, "F");
  setFill(doc, C.ink);
  doc.rect(0, 0, W, 32, "F");
  setText(doc, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Rapport décisionnel", M, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setText(doc, C.slate400);
  const genStr = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
  doc.text(`Période : ${days} jours · Généré le ${genStr}`, M, 24);

  let y = 42;
  setText(doc, C.slate700);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SOMMAIRE", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  setText(doc, C.slate500);
  doc.setFontSize(8.5);
  const toc = [
    { t: "Indicateurs clés de performance", ref: "p. 1" },
    { t: "Analyse textuelle & synthèse", ref: "p. 1" },
    { t: "Annexes graphiques (Axe 7 & 8)", ref: annexPageRangeLabel(chartDataUrls.length) },
  ];
  toc.forEach((item, i) => {
    doc.text(`${i + 1}.`, M, y);
    doc.text(item.t, M + 9, y);
    setText(doc, C.cyan);
    doc.setFont("helvetica", "bold");
    doc.text(item.ref, W - M, y, { align: "right" });
    setText(doc, C.slate500);
    doc.setFont("helvetica", "normal");
    y += 5.8;
  });

  y += 6;
  y = drawSectionRule(doc, W, M, y, "01", "Indicateurs clés");

  const kpis = [
    { label: "Connexions (7 j.)", value: stats?.totalLoginsWeek ?? "—", color: C.cyan },
    { label: "Incidents (7 j.)", value: stats?.totalIncidentsWeek ?? "—", color: C.amber },
    { label: "Volontaires", value: stats?.totalVolonteers ?? "—", color: C.green },
    { label: "Résolution", value: `${rate}%`, color: C.violet },
  ];
  const boxW = (contentW - 8) / 2;
  const boxH = 24;
  kpis.forEach((k, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    drawKpiCard(doc, M + col * (boxW + 8), y + row * (boxH + 7), boxW, boxH, k.label, k.value, k.color);
  });
  y += 2 * (boxH + 7) + 8;

  y = drawSectionRule(doc, W, M, y, "02", "Analyse textuelle");
  const clean = (summary || "")
    .replace(/BILAN\s+HEBDOMADAIRE\s+DYNAMIQUE\s*/gi, "")
    .replace(/-{3,}/g, "")
    .trim();

  setFill(doc, C.slate50);
  setDraw(doc, C.slate200);
  doc.rect(M, y, contentW, Math.min(75, H - y - FOOT - 8), "FD");
  doc.setFont("helvetica", "normal");
  setText(doc, C.slate700);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(clean || "Aucune synthèse disponible pour cette exportation.", contentW - 10);
  let ty = y + 8;
  const maxY = H - FOOT - 12;
  lines.forEach((line) => {
    if (ty > maxY - 4) return;
    doc.text(line, M + 5, ty);
    ty += 4.6;
  });

  // ——— Pages graphiques (2 par page) ———
  const PAGE_HEADER = 16;
  const INNER_TOP = PAGE_HEADER + 4;
  const INNER_BOTTOM = H - FOOT - 3;
  const INNER_H = INNER_BOTTOM - INNER_TOP;
  const GAP = 5;
  const TITLE_H = 6;

  for (let i = 0; i < chartDataUrls.length; ) {
    const remaining = chartDataUrls.length - i;
    const onPage = remaining >= 2 ? 2 : 1;
    const gapTotal = onPage === 2 ? GAP : 0;
    const slotH = (INNER_H - gapTotal) / onPage;

    doc.addPage();
    setFill(doc, C.slate50);
    doc.rect(0, 0, W, PAGE_HEADER, "F");
    setDraw(doc, C.slate200);
    doc.line(0, PAGE_HEADER, W, PAGE_HEADER);
    setText(doc, C.cyan);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ANNEXES", M, 9);
    setText(doc, C.ink);
    doc.setFontSize(11);
    doc.text("Données visuelles", M + 22, 9);
    setText(doc, C.slate400);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Captures haute définition · Pilotage Axe 7 & 8", M, 14);

    for (let j = 0; j < onPage; j += 1) {
      const gi = i + j;
      const dataUrl = chartDataUrls[gi];
      const title = CHART_TITLES[gi] || `Figure ${gi + 1}`;
      const slotY = INNER_TOP + j * (slotH + (onPage === 2 && j > 0 ? GAP : 0));

      setFill(doc, [255, 255, 255]);
      setDraw(doc, C.slate200);
      doc.rect(M - 2, slotY - 1, contentW + 4, slotH + 2, "FD");

      doc.setFont("helvetica", "bold");
      setText(doc, C.slate700);
      doc.setFontSize(8);
      doc.text(`Fig. ${gi + 1} — ${title}`, M + 2, slotY + 5);

      const props = doc.getImageProperties(dataUrl);
      const maxW = contentW - 6;
      const maxH = Math.max(30, slotH - TITLE_H - 6);
      const scale = Math.min(maxW / props.width, maxH / props.height);
      const imgW = props.width * scale;
      const imgH = props.height * scale;
      const x = (W - imgW) / 2;
      const imgY = slotY + TITLE_H + 2;

      setDraw(doc, C.slate200);
      doc.setLineWidth(0.25);
      doc.rect(x - 0.5, imgY - 0.5, imgW + 1, imgH + 1, "S");
      doc.addImage(dataUrl, "PNG", x, imgY, imgW, imgH);
    }

    i += onPage;
  }

  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p);
    drawFooter(doc, p, total, "light");
  }

  doc.save(`Rapport-CiblOrgaSport-${Date.now()}.pdf`);
}
