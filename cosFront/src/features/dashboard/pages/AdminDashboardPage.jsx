import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  LoginOutlined,
  ReportProblem,
  VolunteerActivism,
  PictureAsPdf,
  Security,
  TrendingUp,
  Refresh,
  AccessTime,
  VerifiedUser,
} from "@mui/icons-material";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import appTheme from "../../../common/theme/appTheme";
import adminDashboardService from "../services/adminDashboardService";

const ROLE_COLORS = {
  ADMIN: "#22D3EE",
  ATHLETE: "#A3E635",
  VOLONTEER: "#A78BFA",
};

const PIE_COLORS = ["#22D3EE", "#A3E635", "#A78BFA", "#facc15", "#f97316", "#ef4444"];

function getIncidentSeverity(count) {
  if (count <= 2) return { label: "Situation normale", color: "#22c55e", bg: "rgba(34,197,94,0.15)" };
  if (count <= 5) return { label: "Vigilance accrue", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
  return { label: "Alerte comité de direction", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
}

function getResolutionColor(rate) {
  if (rate < 50) return "#ef4444";
  if (rate < 80) return "#f59e0b";
  return "#22c55e";
}

function getSessionColor(role, value) {
  if (role === "VOLONTEER" && value < 2) return "#f97316";
  return ROLE_COLORS[role] || "#22D3EE";
}

function KpiCard({ title, value, icon, accentColor }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: appTheme.gradients.card,
        boxShadow: appTheme.shadows.card,
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 16,
          bottom: 16,
          width: 4,
          borderRadius: 6,
          background: accentColor,
        }}
      />
      <CardContent sx={{ pl: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accentColor}22`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, color: appTheme.colors.textMuted, mb: 0.3 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload, label, suffix }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper
      sx={{
        p: 1.5,
        background: appTheme.colors.dark,
        border: `1px solid ${appTheme.colors.cyan}55`,
        borderRadius: 2,
      }}
    >
      <Typography sx={{ fontSize: 12, color: appTheme.colors.textMuted }}>{label}</Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: appTheme.colors.cyan }}>
        {payload[0].value} {suffix || ""}
      </Typography>
    </Paper>
  );
}

function SectionCard({ children, title, icon, refProp }) {
  return (
    <Card
      ref={refProp}
      sx={{
        borderRadius: 4,
        background: appTheme.gradients.card,
        boxShadow: appTheme.shadows.card,
        mb: 4,
        p: 3,
      }}
    >
      {title && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {icon}
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
            {title}
          </Typography>
        </Box>
      )}
      {children}
    </Card>
  );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  const chartLoginRef = useRef(null);
  const chartTrafficRef = useRef(null);
  const chartRoleRef = useRef(null);
  const chartSessionRef = useRef(null);
  const chartSectionsRef = useRef(null);

  const fetchData = useCallback(async (period) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getStats(period);
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const text = await adminDashboardService.getReportSummary();
      setSummary(text);
    } catch {
      setSummary("Impossible de charger le résumé du rapport.");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
    fetchSummary();
  }, [fetchData, fetchSummary, days]);

  const handleRefresh = () => {
    fetchData(days);
    fetchSummary();
  };

  const handlePeriodChange = (_, newVal) => {
    if (newVal !== null) setDays(newVal);
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 15;
      let y = 0;

      const hex = (h) => {
        const r = parseInt(h.slice(1, 3), 16);
        const g = parseInt(h.slice(3, 5), 16);
        const b = parseInt(h.slice(5, 7), 16);
        return [r, g, b];
      };

      const ensureSpace = (needed) => {
        if (y + needed > H - 15) {
          doc.addPage();
          y = M;
        }
      };

      const drawSeparator = () => {
        ensureSpace(8);
        doc.setDrawColor(...hex("#334155"));
        doc.setLineWidth(0.3);
        doc.line(M, y, W - M, y);
        y += 6;
      };

      const sectionTitle = (text) => {
        ensureSpace(14);
        doc.setFillColor(...hex("#0F172A"));
        doc.roundedRect(M, y, W - 2 * M, 10, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...hex("#22D3EE"));
        doc.text(text, M + 4, y + 7);
        y += 14;
      };

      const labelValue = (label, value, color) => {
        ensureSpace(7);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...hex("#94A3B8"));
        doc.text(label, M + 2, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...hex(color || "#F9FAFB"));
        doc.text(String(value), M + 90, y);
        y += 6;
      };

      doc.setFillColor(...hex("#1E293B"));
      doc.rect(0, 0, W, 48, "F");
      doc.setFillColor(...hex("#22D3EE"));
      doc.rect(0, 48, W, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("Rapport Décisionnel", W / 2, 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...hex("#94A3B8"));
      doc.text("CiblOrgaSport — Dashboard Admin", W / 2, 28, { align: "center" });

      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
      doc.setFontSize(9);
      doc.setTextColor(...hex("#64748B"));
      doc.text(`Généré le ${dateStr} — Période : ${days} jours`, W / 2, 36, { align: "center" });

      y = 56;

      sectionTitle("1. Indicateurs Clés (KPI)");

      const kpiW = (W - 2 * M - 9) / 4;
      const kpis = [
        { label: "Connexions", value: stats?.totalLoginsWeek ?? 0, color: "#22D3EE" },
        { label: "Incidents", value: stats?.totalIncidentsWeek ?? 0, color: getIncidentSeverity(stats?.totalIncidentsWeek ?? 0).color },
        { label: "Volontaires", value: stats?.totalVolonteers ?? 0, color: "#A3E635" },
        { label: "Résolution", value: `${resolutionRate}%`, color: resolutionColor },
      ];

      ensureSpace(28);
      kpis.forEach((kpi, i) => {
        const x = M + i * (kpiW + 3);
        doc.setFillColor(...hex("#0F172A"));
        doc.roundedRect(x, y, kpiW, 22, 3, 3, "F");

        doc.setFillColor(...hex(kpi.color));
        doc.roundedRect(x, y, 1.5, 22, 1, 1, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...hex("#94A3B8"));
        doc.text(kpi.label, x + 5, y + 8);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...hex(kpi.color));
        doc.text(String(kpi.value), x + 5, y + 18);
      });
      y += 28;

      ensureSpace(16);
      const sevData = getIncidentSeverity(stats?.totalIncidentsWeek ?? 0);
      doc.setFillColor(...hex("#0F172A"));
      doc.roundedRect(M, y, W - 2 * M, 12, 2, 2, "F");
      doc.setFillColor(...hex(sevData.color));
      doc.roundedRect(M, y, 1.5, 12, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...hex(sevData.color));
      doc.text(`Sécurité : ${sevData.label}`, M + 5, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...hex("#94A3B8"));
      doc.text(`${stats?.totalIncidentsWeek ?? 0} incident(s) — Taux de résolution : ${resolutionRate}%`, M + 5, y + 10);
      y += 18;

      drawSeparator();

      sectionTitle("2. Activité & Engagement (Axe 7)");

      labelValue("Connexions totales sur la période", stats?.totalLoginsWeek ?? 0);

      if (stats?.loginsByRole) {
        ensureSpace(8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...hex("#94A3B8"));
        doc.text("Répartition par rôle :", M + 2, y);
        y += 6;
        Object.entries(stats.loginsByRole).forEach(([role, val]) => {
          labelValue(`     ${role}`, `${val} connexions`, ROLE_COLORS[role] || "#F9FAFB");
        });
      }

      y += 2;
      if (stats?.averageSessionByRole) {
        ensureSpace(8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...hex("#94A3B8"));
        doc.text("Durée moyenne de session :", M + 2, y);
        y += 6;

        const roles = Object.entries(stats.averageSessionByRole);
        ensureSpace(roles.length * 9 + 10);
        const tblX = M + 2;
        const tblW = W - 2 * M - 4;
        const rowH = 8;

        doc.setFillColor(...hex("#0F172A"));
        doc.roundedRect(tblX, y, tblW, rowH, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...hex("#22D3EE"));
        doc.text("Rôle", tblX + 4, y + 5.5);
        doc.text("Durée moy. (min)", tblX + tblW - 40, y + 5.5);
        y += rowH;

        roles.forEach(([role, dur], i) => {
          const bgColor = i % 2 === 0 ? "#1E293B" : "#0F172A";
          doc.setFillColor(...hex(bgColor));
          doc.rect(tblX, y, tblW, rowH, "F");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...hex("#CBD5E1"));
          doc.text(role, tblX + 4, y + 5.5);

          const valColor = role === "VOLONTEER" && dur < 2 ? "#f97316" : "#F9FAFB";
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...hex(valColor));
          doc.text(`${parseFloat(dur).toFixed(1)} min`, tblX + tblW - 40, y + 5.5);
          y += rowH;
        });
        y += 4;
      }

      drawSeparator();

      sectionTitle("3. Éco-conception & Optimisation (Axe 8)");

      if (stats?.topViewedSections) {
        ensureSpace(8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...hex("#94A3B8"));
        doc.text("Sections les plus consultées :", M + 2, y);
        y += 6;

        const sections = Object.entries(stats.topViewedSections);
        ensureSpace(sections.length * 9 + 10);
        const tblX2 = M + 2;
        const tblW2 = W - 2 * M - 4;
        const rowH2 = 8;

        doc.setFillColor(...hex("#0F172A"));
        doc.roundedRect(tblX2, y, tblW2, rowH2, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...hex("#22D3EE"));
        doc.text("Section", tblX2 + 4, y + 5.5);
        doc.text("Consultations", tblX2 + tblW2 - 35, y + 5.5);
        y += rowH2;

        const maxViews = Math.max(...sections.map(([, v]) => v), 1);
        sections.forEach(([name, count], i) => {
          const bgColor = i % 2 === 0 ? "#1E293B" : "#0F172A";
          doc.setFillColor(...hex(bgColor));
          doc.rect(tblX2, y, tblW2, rowH2, "F");

          const barW = ((count / maxViews) * (tblW2 - 8)) * 0.4;
          doc.setFillColor(...hex(PIE_COLORS[i % PIE_COLORS.length]));
          doc.roundedRect(tblX2 + 2, y + 1.5, barW, 5, 1, 1, "F");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...hex("#CBD5E1"));
          doc.text(name, tblX2 + barW + 6, y + 5.5);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(...hex("#F9FAFB"));
          doc.text(`${count}`, tblX2 + tblW2 - 35, y + 5.5);
          y += rowH2;
        });
        y += 4;
      }

      labelValue("Taux de résolution incidents", `${resolutionRate}%`, resolutionColor);
      y += 2;

      drawSeparator();

      sectionTitle("4. Visualisations Graphiques");

      const chartConfigs = [
        { ref: chartRoleRef, title: "Répartition des Acteurs" },
        { ref: chartTrafficRef, title: "Trafic Horaire" },
        { ref: chartLoginRef, title: "Connexions par Jour" },
        { ref: chartSessionRef, title: "Session Moyenne par Rôle" },
        { ref: chartSectionsRef, title: "Sections Consultées" },
      ];

      for (const cfg of chartConfigs) {
        if (cfg.ref.current) {
          const canvas = await html2canvas(cfg.ref.current, { backgroundColor: "#1E293B", scale: 2 });
          const imgData = canvas.toDataURL("image/png");

          const imgW = W - 2 * M;
          const ratio = canvas.height / canvas.width;
          const imgH = imgW * ratio;
          const needed = imgH + 14;

          ensureSpace(needed);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(...hex("#CBD5E1"));
          doc.text(cfg.title, M, y + 4);
          y += 7;

          doc.setFillColor(...hex("#0F172A"));
          doc.roundedRect(M - 1, y - 1, imgW + 2, imgH + 2, 2, 2, "F");
          doc.addImage(imgData, "PNG", M, y, imgW, imgH);
          y += imgH + 8;
        }
      }

      if (summary) {
        drawSeparator();
        sectionTitle("5. Synthèse du Rapport");
        ensureSpace(20);

        const lines = doc.splitTextToSize(summary, W - 2 * M - 8);
        const blockH = lines.length * 4.5 + 8;
        ensureSpace(blockH);

        doc.setFillColor(...hex("#0F172A"));
        doc.roundedRect(M, y, W - 2 * M, blockH, 2, 2, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...hex("#CBD5E1"));
        doc.text(lines, M + 4, y + 6);
        y += blockH + 4;
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFillColor(...hex("#1E293B"));
        doc.rect(0, H - 10, W, 10, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...hex("#64748B"));
        doc.text("CiblOrgaSport — Rapport confidentiel", M, H - 4);
        doc.text(`Page ${p}/${pageCount}`, W - M, H - 4, { align: "right" });
      }

      doc.save(`rapport-admin-${Date.now()}.pdf`);
    } catch {
      setError("Erreur lors de la génération du PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: appTheme.colors.cyan }} />
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const severity = getIncidentSeverity(stats?.totalIncidentsWeek ?? 0);
  const resolutionRate = stats?.incidentResolutionRate ?? 0;
  const resolutionColor = getResolutionColor(resolutionRate);

  const pieData = stats?.loginsByRole
    ? Object.entries(stats.loginsByRole).map(([name, value]) => ({ name, value }))
    : [];

  const sessionData = stats?.averageSessionByRole
    ? Object.entries(stats.averageSessionByRole).map(([role, value]) => ({ role, value: parseFloat(value) }))
    : [];

  const sectionsData = stats?.topViewedSections
    ? Object.entries(stats.topViewedSections).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Dashboard & Reporting
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <ToggleButtonGroup
            value={days}
            exclusive
            onChange={handlePeriodChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: appTheme.colors.textMuted,
                borderColor: "#334155",
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
                  color: "#fff",
                  borderColor: "transparent",
                },
              },
            }}
          >
            <ToggleButton value={7}>7 jours</ToggleButton>
            <ToggleButton value={30}>30 jours</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: appTheme.radius.pill,
              borderColor: "#334155",
              color: appTheme.colors.textSecondary,
              "&:hover": { borderColor: appTheme.colors.cyan, color: appTheme.colors.cyan },
            }}
          >
            Rafraîchir
          </Button>

          <Button
            variant="contained"
            startIcon={pdfLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <PictureAsPdf />}
            disabled={pdfLoading}
            onClick={handleDownloadPdf}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: "#fff",
              "&:hover": { background: "linear-gradient(135deg, #06B6D4, #2563EB)" },
            }}
          >
            {pdfLoading ? "Génération…" : "Exporter PDF"}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Connexions cette semaine"
            value={stats?.totalLoginsWeek ?? "—"}
            icon={<LoginOutlined sx={{ fontSize: 28, color: appTheme.colors.cyan }} />}
            accentColor={appTheme.colors.cyan}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Incidents cette semaine"
            value={stats?.totalIncidentsWeek ?? "—"}
            icon={<ReportProblem sx={{ fontSize: 28, color: severity.color }} />}
            accentColor={severity.color}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Volontaires inscrits"
            value={stats?.totalVolonteers ?? "—"}
            icon={<VolunteerActivism sx={{ fontSize: 28, color: appTheme.colors.green }} />}
            accentColor={appTheme.colors.green}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Résolution incidents"
            value={`${resolutionRate}%`}
            icon={<VerifiedUser sx={{ fontSize: 28, color: resolutionColor }} />}
            accentColor={resolutionColor}
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 4,
          background: appTheme.gradients.card,
          boxShadow: appTheme.shadows.card,
          mb: 4,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Security sx={{ fontSize: 32, color: severity.color }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#fff", mb: 0.3 }}>
            Niveau de sécurité
          </Typography>
          <Typography sx={{ fontSize: 12, color: appTheme.colors.textMuted }}>
            Basé sur le nombre d'incidents ({stats?.totalIncidentsWeek ?? 0}) — Taux de résolution :{" "}
            <span style={{ color: resolutionColor, fontWeight: 700 }}>{resolutionRate}%</span>
          </Typography>
        </Box>
        <Chip
          label={severity.label}
          sx={{
            fontWeight: 700,
            fontSize: 13,
            color: severity.color,
            background: severity.bg,
            border: `1px solid ${severity.color}44`,
          }}
        />
      </Card>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Répartition des Acteurs"
            icon={<LoginOutlined sx={{ color: appTheme.colors.cyan }} />}
            refProp={chartRoleRef}
          >
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={ROLE_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ color: appTheme.colors.textSecondary, fontSize: 13 }}
                    formatter={(value) => <span style={{ color: appTheme.colors.textSecondary }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{
                      background: appTheme.colors.dark,
                      border: `1px solid ${appTheme.colors.cyan}55`,
                      borderRadius: 8,
                      color: "#fff",
                    }}
                    formatter={(value, name) => [`${value} connexions`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Pics d'affluence (trafic horaire)"
            icon={<AccessTime sx={{ color: appTheme.colors.cyan }} />}
            refProp={chartTrafficRef}
          >
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.hourlyTraffic ?? []}>
                  <defs>
                    <linearGradient id="gradientViolet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={appTheme.colors.violet} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={appTheme.colors.violet} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" stroke={appTheme.colors.textMuted} tick={{ fontSize: 12, fill: appTheme.colors.textMuted }} />
                  <YAxis stroke={appTheme.colors.textMuted} tick={{ fontSize: 12, fill: appTheme.colors.textMuted }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip suffix="requêtes" />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={appTheme.colors.violet}
                    strokeWidth={2.5}
                    fill="url(#gradientViolet)"
                    dot={{ r: 4, fill: appTheme.colors.violet, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#fff", stroke: appTheme.colors.violet, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        title="Fréquentation — Connexions par jour"
        icon={<TrendingUp sx={{ color: appTheme.colors.cyan }} />}
        refProp={chartLoginRef}
      >
        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.loginHistory ?? []}>
              <defs>
                <linearGradient id="gradientCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={appTheme.colors.cyan} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={appTheme.colors.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke={appTheme.colors.textMuted} tick={{ fontSize: 12, fill: appTheme.colors.textMuted }} />
              <YAxis stroke={appTheme.colors.textMuted} tick={{ fontSize: 12, fill: appTheme.colors.textMuted }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip suffix="connexions" />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={appTheme.colors.cyan}
                strokeWidth={2.5}
                fill="url(#gradientCyan)"
                dot={{ r: 4, fill: appTheme.colors.cyan, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#fff", stroke: appTheme.colors.cyan, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </SectionCard>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Durée moyenne de session par rôle (min)"
            icon={<AccessTime sx={{ color: appTheme.colors.green }} />}
            refProp={chartSessionRef}
          >
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke={appTheme.colors.textMuted} tick={{ fontSize: 12, fill: appTheme.colors.textMuted }} />
                  <YAxis type="category" dataKey="role" stroke={appTheme.colors.textMuted} tick={{ fontSize: 12, fill: appTheme.colors.textMuted }} width={90} />
                  <Tooltip
                    contentStyle={{
                      background: appTheme.colors.dark,
                      border: `1px solid ${appTheme.colors.cyan}55`,
                      borderRadius: 8,
                      color: "#fff",
                    }}
                    formatter={(value) => [`${value} min`, "Durée moy."]}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {sessionData.map((entry) => (
                      <Cell key={entry.role} fill={getSessionColor(entry.role, entry.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            {sessionData.some((d) => d.role === "VOLONTEER" && d.value < 2) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Les volontaires passent moins de 2 min en moyenne — problème d'ergonomie probable.
              </Alert>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Sections les plus consultées"
            icon={<TrendingUp sx={{ color: appTheme.colors.green }} />}
            refProp={chartSectionsRef}
          >
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke={appTheme.colors.textMuted} tick={{ fontSize: 12, fill: appTheme.colors.textMuted }} />
                  <YAxis type="category" dataKey="name" stroke={appTheme.colors.textMuted} tick={{ fontSize: 11, fill: appTheme.colors.textMuted }} width={140} />
                  <Tooltip
                    contentStyle={{
                      background: appTheme.colors.dark,
                      border: `1px solid ${appTheme.colors.cyan}55`,
                      borderRadius: 8,
                      color: "#fff",
                    }}
                    formatter={(value) => [`${value} vues`, "Consultations"]}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {sectionsData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#fff", mb: 2 }}>
          Aperçu du rapport
        </Typography>

        {summaryLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} sx={{ color: appTheme.colors.cyan }} />
          </Box>
        ) : (
          <Paper
            sx={{
              p: 2.5,
              background: "rgba(15,23,42,0.6)",
              borderRadius: 3,
              border: "1px solid #334155",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                color: appTheme.colors.textSecondary,
                whiteSpace: "pre-wrap",
                lineHeight: 1.75,
              }}
            >
              {(summary || "Aucun rapport disponible pour le moment.").replace(/BILAN\s+HEBDOMADAIRE\s+DYNAMIQUE\s*/gi, "").replace(/-{3,}/g, "").trim()}
            </Typography>
          </Paper>
        )}
      </SectionCard>
    </Box>
  );
}
