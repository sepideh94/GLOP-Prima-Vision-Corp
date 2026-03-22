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
  ArticleOutlined,
  SpaceDashboardOutlined,
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
import appTheme from "../../../common/theme/appTheme";
import adminDashboardService from "../services/adminDashboardService";
import { saveDashboardPdf } from "../utils/buildDashboardPdf";

const ROLE_COLORS = {
  ADMIN: "#22D3EE",
  ATHLETE: "#F97316",
  VOLONTEER: "#A78BFA",
  COMMISSIONNER: "#6366F1",
  /** Variante d’orthographe si l’API renvoie ce libellé */
  COMMISSIONER: "#6366F1",
  /** Rose / fuchsia : évite le fallback PIE_COLORS[0] = cyan comme ADMIN */
  SPECTATOR: "#EC4899",
};

const PIE_COLORS = ["#14B8A6", "#F97316", "#A78BFA", "#facc15", "#6366F1", "#EC4899", "#ef4444"];

/** Bordures légères (évite le gris #334155 trop dur sur fond sombre) */
const borderShell = "1px solid rgba(226, 232, 240, 0.14)";
const borderShellHover = "rgba(203, 213, 225, 0.22)";
const borderToggle = "rgba(148, 163, 184, 0.28)";

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
  return ROLE_COLORS[role] || "#64748B";
}

function KpiCard({ title, value, icon, accentColor }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: appTheme.gradients.card,
        boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
        border: borderShell,
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
        border: "1px solid rgba(34, 211, 238, 0.35)",
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

const chartPanelSx = {
  bgcolor: "#ffffff",
  borderRadius: 3,
  border: "1px solid #e8edf4",
  boxShadow: "0 4px 22px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)",
  p: { xs: 1.5, sm: 2.5 },
};

const axisMuted = "#64748b";
const gridLight = "#e2e8f0";

function SectionCard({ children, title, icon, refProp, chartSurface = false }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: appTheme.gradients.card,
        boxShadow: "0 12px 32px rgba(0,0,0,0.24)",
        border: borderShell,
        mb: 4,
        p: 3,
        overflow: "hidden",
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
      {chartSurface ? (
        <Box ref={refProp} sx={chartPanelSx}>
          {children}
        </Box>
      ) : (
        children
      )}
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
  const [refreshing, setRefreshing] = useState(false);

  const chartLoginRef = useRef(null);
  const chartTrafficRef = useRef(null);
  const chartRoleRef = useRef(null);
  const chartSessionRef = useRef(null);
  const chartSectionsRef = useRef(null);

  const fetchData = useCallback(async (period, { silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await adminDashboardService.getStats(period);
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setSummaryLoading(true);
      const text = await adminDashboardService.getReportSummary();
      setSummary(text);
    } catch {
      setSummary("Impossible de charger le résumé du rapport.");
    } finally {
      if (!silent) setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
    fetchSummary();
  }, [fetchData, fetchSummary, days]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchData(days, { silent: true }), fetchSummary({ silent: true })]);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (_, newVal) => {
    if (newVal !== null) setDays(newVal);
  };

  /** PDF généré côté client : une page par graphique, lisible et hi-res. */
  const handleDownloadPdf = async () => {
    if (!stats) return;
    try {
      setPdfLoading(true);
      setError(null);

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 2;
      const captureScale = Math.min(3, Math.max(2.5, dpr * 1.2));

      const html2canvasOpts = {
        backgroundColor: "#ffffff",
        scale: captureScale,
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 30000,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
      };

      const chartRefs = [chartRoleRef, chartTrafficRef, chartLoginRef, chartSessionRef, chartSectionsRef];
      const chartDataUrls = [];

      await new Promise((r) => setTimeout(r, 220));

      for (const ref of chartRefs) {
        if (ref.current) {
          await new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
          });
          const canvas = await html2canvas(ref.current, html2canvasOpts);
          chartDataUrls.push(canvas.toDataURL("image/png", 1));
        }
      }

      saveDashboardPdf({ stats, days, summary, chartDataUrls });
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
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: appTheme.gradients.card,
          boxShadow: "0 16px 44px rgba(0,0,0,0.26)",
          border: borderShell,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 3,
            width: "100%",
            background: "linear-gradient(90deg, #22D3EE, #3B82F6, #A78BFA)",
            opacity: 0.9,
          }}
        />
        <CardContent sx={{ py: 2.75, px: { xs: 2, sm: 3 }, "&:last-child": { pb: 2.75 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", lg: "center" },
              flexDirection: { xs: "column", lg: "row" },
              gap: 2.5,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                flex: { xs: "1 1 auto", lg: "0 1 420px" },
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                background: "linear-gradient(160deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 55%, rgba(15,23,42,0.2) 100%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: "linear-gradient(145deg, rgba(34,211,238,0.28), rgba(59,130,246,0.2))",
                    border: "1px solid rgba(34, 211, 238, 0.35)",
                    boxShadow: "0 6px 20px rgba(34, 211, 238, 0.12)",
                  }}
                >
                  <SpaceDashboardOutlined sx={{ fontSize: 30, color: appTheme.colors.cyan }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { xs: 22, sm: 28 },
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: -0.5,
                      lineHeight: 1.15,
                    }}
                  >
                    Dashboard & Reporting
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: appTheme.colors.textMuted,
                      mt: 0.5,
                      fontWeight: 500,
                      letterSpacing: 0.02,
                    }}
                  >
                    Synthèse visuelle et export PDF
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ display: { xs: "none", lg: "block" }, flex: 1, minWidth: 280 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                justifyContent: { xs: "flex-start", lg: "flex-end" },
              }}
            >
              <ToggleButtonGroup
                value={days}
                exclusive
                onChange={handlePeriodChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    color: appTheme.colors.textMuted,
                    borderColor: borderToggle,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2,
                    "&:hover": {
                      borderColor: borderShellHover,
                      background: "rgba(255,255,255,0.04)",
                    },
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
                variant="contained"
                disableElevation
                disabled={refreshing}
                startIcon={
                  refreshing ? (
                    <CircularProgress size={18} thickness={5} sx={{ color: "inherit" }} />
                  ) : (
                    <Refresh />
                  )
                }
                onClick={handleRefresh}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: appTheme.radius.pill,
                  px: 2.75,
                  py: 1,
                  background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(59,130,246,0.15))",
                  color: "#e0f2fe",
                  border: "1px solid rgba(34, 211, 238, 0.45)",
                  "&:hover": {
                    background: "linear-gradient(135deg, rgba(34,211,238,0.32), rgba(59,130,246,0.22))",
                    borderColor: appTheme.colors.cyan,
                  },
                  "&.Mui-disabled": {
                    color: "rgba(224, 242, 254, 0.65)",
                    borderColor: "rgba(34, 211, 238, 0.25)",
                  },
                }}
              >
                {refreshing ? "Actualisation…" : "Rafraîchir"}
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
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Connexions (7 jours)"
            value={stats?.totalLoginsWeek ?? "—"}
            icon={<LoginOutlined sx={{ fontSize: 28, color: appTheme.colors.cyan }} />}
            accentColor={appTheme.colors.cyan}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Incidents (7 jours)"
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
          boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
          border: borderShell,
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
            chartSurface
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
                    wrapperStyle={{ color: axisMuted, fontSize: 13, paddingTop: 16 }}
                    formatter={(value) => <span style={{ color: "#475569", fontWeight: 600 }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{
                      background: appTheme.colors.dark,
                      border: "1px solid rgba(34, 211, 238, 0.35)",
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
            chartSurface
          >
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.hourlyTraffic ?? []}>
                  <defs>
                    <linearGradient id="gradientViolet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={appTheme.colors.violet} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={appTheme.colors.violet} stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLight} vertical={false} />
                  <XAxis dataKey="label" stroke={axisMuted} tick={{ fontSize: 12, fill: axisMuted }} tickLine={{ stroke: gridLight }} />
                  <YAxis stroke={axisMuted} tick={{ fontSize: 12, fill: axisMuted }} tickLine={{ stroke: gridLight }} allowDecimals={false} />
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
        chartSurface
      >
        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.loginHistory ?? []}>
              <defs>
                <linearGradient id="gradientCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={appTheme.colors.cyan} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={appTheme.colors.cyan} stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLight} vertical={false} />
              <XAxis dataKey="label" stroke={axisMuted} tick={{ fontSize: 12, fill: axisMuted }} tickLine={{ stroke: gridLight }} />
              <YAxis stroke={axisMuted} tick={{ fontSize: 12, fill: axisMuted }} tickLine={{ stroke: gridLight }} allowDecimals={false} />
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
            chartSurface
          >
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLight} horizontal={false} />
                  <XAxis type="number" stroke={axisMuted} tick={{ fontSize: 12, fill: axisMuted }} tickLine={{ stroke: gridLight }} />
                  <YAxis type="category" dataKey="role" stroke={axisMuted} tick={{ fontSize: 12, fill: axisMuted }} width={90} tickLine={{ stroke: gridLight }} />
                  <Tooltip
                    contentStyle={{
                      background: appTheme.colors.dark,
                      border: "1px solid rgba(34, 211, 238, 0.35)",
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
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
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
            chartSurface
          >
            {sectionsData.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Aucune consultation enregistrée sur cette période (données « sections les plus consultées » de l&apos;API admin). Quand
                le serveur alimentera ces compteurs, le graphique apparaîtra ici — utile pour repérer les écrans peu utilisés et limiter la
                charge inutile (Axe 8).
              </Alert>
            ) : (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridLight} horizontal={false} />
                    <XAxis type="number" stroke={axisMuted} tick={{ fontSize: 12, fill: axisMuted }} tickLine={{ stroke: gridLight }} />
                    <YAxis type="category" dataKey="name" stroke={axisMuted} tick={{ fontSize: 11, fill: axisMuted }} width={140} tickLine={{ stroke: gridLight }} />
                    <Tooltip
                      contentStyle={{
                        background: appTheme.colors.dark,
                        border: "1px solid rgba(34, 211, 238, 0.35)",
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
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        title="Aperçu du rapport"
        icon={<ArticleOutlined sx={{ color: appTheme.colors.cyan }} />}
        chartSurface
      >
        {summaryLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} sx={{ color: appTheme.colors.cyan }} />
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: "#fafbfc",
              borderRadius: 2,
              border: "1px solid #eef2f7",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                color: "#334155",
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
