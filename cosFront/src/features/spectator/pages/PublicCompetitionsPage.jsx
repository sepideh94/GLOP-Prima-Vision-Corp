import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Button,
  Pagination,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import publicResultsService from "../services/publicResultsService";
import PublicNavbar from "../../../common/components/PublicNavbar";
import Footer from "../../../common/components/Footer";

const INK = "#0f172a";
const INK_MUTED = "#64748b";
const CARD_BORDER = "rgba(15, 23, 42, 0.08)";
const PAL = {
  blue: "#0ea5e9",
  blueDeep: "#0369a1",
  cyan: "#22d3ee",
  green: "#4ade80",
  greenDeep: "#16a34a",
  yellow: "#facc15",
  orange: "#fb923c",
  orangeDeep: "#ea580c",
  violet: "#a78bfa",
};
const COMPETITIONS_PER_PAGE = 6;

const parseDateSafe = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const onlyDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (onlyDate) {
    const local = new Date(Number(onlyDate[1]), Number(onlyDate[2]) - 1, Number(onlyDate[3]), 12, 0, 0);
    return Number.isNaN(local.getTime()) ? null : local;
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

function goToCompetitionResults(navigate, competitionId) {
  sessionStorage.setItem("ciblorga_public_competition_id", String(competitionId));
  navigate("/resultats");
}

function formatPublishedShort(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PublicCompetitionsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const listStats = useMemo(() => {
    const now = new Date();
    let aVenir = 0;
    let enCours = 0;
    let terminees = 0;
    for (const c of list) {
      const start = parseDateSafe(c?.startDate);
      const end = parseDateSafe(c?.endDate);
      if (!start || !end) continue;
      if (now < start) aVenir += 1;
      else if (now > end) terminees += 1;
      else enCours += 1;
    }
    return { total: list.length, aVenir, enCours, terminees };
  }, [list]);
  const totalPages = Math.max(1, Math.ceil(list.length / COMPETITIONS_PER_PAGE));
  const pagedList = useMemo(() => {
    const start = (page - 1) * COMPETITIONS_PER_PAGE;
    return list.slice(start, start + COMPETITIONS_PER_PAGE);
  }, [list, page]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const competitions = await publicResultsService.getCompetitionsWithResults();
        if (cancelled) return;
        const sorted = [...(Array.isArray(competitions) ? competitions : [])].sort((a, b) => {
          const da = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0;
          const db = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0;
          return db - da;
        });
        setList(sorted);
        setPage(1);
      } catch {
        if (!cancelled) {
          setList([]);
          setError("Impossible de charger la liste des compétitions pour le moment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${import.meta.env.BASE_URL}images/home/sport-athletisme.jpg?v=20250324e)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2.5px) saturate(1.08)",
          transform: "scale(1.03)",
          opacity: 0.34,
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 12% 18%, rgba(34,211,238,0.24) 0%, transparent 42%),
            radial-gradient(circle at 88% 12%, rgba(167,139,250,0.2) 0%, transparent 40%),
            linear-gradient(168deg, rgba(236,254,255,0.92) 0%, rgba(240,253,244,0.9) 55%, rgba(250,245,255,0.9) 100%)
          `,
          zIndex: 0,
        },
      }}
    >
      <PublicNavbar themeVariant="darkHome" />

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, mt: "64px", flex: 1, position: "relative", zIndex: 1 }}>
        <Card
          elevation={0}
          sx={{
            mb: 3.2,
            borderRadius: 3,
            border: `1px solid ${CARD_BORDER}`,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 10px 32px rgba(15,23,42,0.07)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              gap={2}
            >
              <Box>
                <Button
                  component={RouterLink}
                  to="/"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    mb: 1.3,
                    color: "#0f172a",
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: 999,
                    border: "1px solid rgba(14,165,233,0.28)",
                    bgcolor: "rgba(255,255,255,0.95)",
                    px: 2,
                    "&:hover": { bgcolor: "#fff" },
                  }}
                >
                  Accueil
                </Button>
                <Chip
                  label="Annuaire public"
                  sx={{
                    ml: 1,
                    mb: 1.3,
                    fontWeight: 800,
                    bgcolor: `${PAL.orange}22`,
                    color: PAL.orangeDeep,
                    border: `1px solid ${PAL.orange}55`,
                  }}
                />
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "1.85rem", md: "2.35rem" },
                    fontWeight: 900,
                    color: INK,
                    letterSpacing: "-0.03em",
                    mb: 0.8,
                  }}
                >
                  Toutes les compétitions avec résultats
                </Typography>
                <Typography sx={{ color: INK_MUTED, maxWidth: 740, lineHeight: 1.7, fontSize: 16 }}>
                  Consultez les informations clés des compétitions et accédez rapidement aux classements publiés.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Box
          sx={{
            mb: 3.4,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 1.25,
          }}
        >
          {[
            { label: "Compétitions", value: listStats.total, tone: PAL.blue },
            { label: "À venir", value: listStats.aVenir, tone: PAL.orange },
            { label: "En cours", value: listStats.enCours, tone: PAL.greenDeep },
            { label: "Terminées", value: listStats.terminees, tone: PAL.violet },
          ].map((s) => (
            <Box
              key={s.label}
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: `${s.tone}12`,
                border: `1px solid ${s.tone}44`,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: INK_MUTED, textTransform: "uppercase" }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: s.tone, lineHeight: 1.1 }}>{s.value}</Typography>
            </Box>
          ))}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: PAL.blue }} />
          </Box>
        ) : list.length === 0 ? (
          <Card elevation={0} sx={{ border: `1px dashed ${PAL.orange}44`, borderRadius: 3, bgcolor: "#fffbeb" }}>
            <CardContent sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ color: INK_MUTED, fontWeight: 600 }}>
                Aucune compétition avec résultats publics pour l’instant.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                list.length === 1
                  ? "1fr"
                  : { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
              gap: 3.2,
            }}
            >
              {pagedList.map((c, idx) => {
              const nTrials = Array.isArray(c.trialGroups) ? c.trialGroups.length : 0;
              const stripe = [PAL.cyan, PAL.green, PAL.violet, PAL.orange][idx % 4];
              const trialsWithResults = (Array.isArray(c.trialGroups) ? c.trialGroups : []).filter(
                (tg) => Array.isArray(tg?.results) && tg.results.length > 0
              ).length;
              const hasResults = trialsWithResults > 0;
              const startAt = parseDateSafe(c?.startDate);
              const endAt = parseDateSafe(c?.endDate);
              const now = new Date();
              const statusLabel = startAt && endAt ? (now < startAt ? "À venir" : now > endAt ? "Terminée" : "En cours") : "Planifiée";
              const formatDateOnly = (d) =>
                d
                  ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "Non renseignée";
              return (
                <Card
                  key={c.competitionId}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${CARD_BORDER}`,
                    bgcolor: "#fff",
                    overflow: "hidden",
                    minHeight: 320,
                    boxShadow: `0 14px 42px rgba(15,23,42,0.1), 0 0 0 1px ${stripe}1f`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 20px 50px rgba(15,23,42,0.12), 0 0 0 2px ${stripe}40`,
                    },
                  }}
                >
                  <Box sx={{ alignItems: "stretch", flexDirection: "column", display: "flex", height: "100%" }}>
                    <Box
                      sx={{
                        height: 84,
                        width: "100%",
                        px: 2.25,
                        py: 1.8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: `linear-gradient(110deg, ${stripe}2b 0%, rgba(255,255,255,0.95) 38%, ${PAL.blue}1c 100%)`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: `${stripe}22`,
                            border: `1px solid ${stripe}55`,
                          }}
                        >
                          <EmojiEventsIcon sx={{ color: stripe, fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: INK, fontSize: 14.5 }}>
                          Compétition publique
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label={statusLabel}
                        sx={{
                          fontWeight: 800,
                          bgcolor:
                            statusLabel === "En cours"
                              ? `${PAL.green}24`
                              : statusLabel === "Terminée"
                                ? `${PAL.blue}20`
                                : `${PAL.orange}20`,
                          color:
                            statusLabel === "En cours"
                              ? PAL.greenDeep
                              : statusLabel === "Terminée"
                                ? PAL.blueDeep
                                : PAL.orangeDeep,
                        }}
                      />
                    </Box>
                    <Box sx={{ height: 5, background: `linear-gradient(90deg, ${stripe}, ${PAL.blue}, ${PAL.cyan})` }} />
                    <CardContent
                      sx={{
                        p: 3,
                        textAlign: "left",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        gap: 0.35,
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, color: INK, fontSize: 19, mb: 1.25, lineHeight: 1.3 }}>
                        {c.competitionName || `Compétition ${c.competitionId}`}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.75, mb: 1.5 }}>
                        <Chip
                          size="small"
                          label={nTrials > 0 ? `${nTrials} épreuve${nTrials > 1 ? "s" : ""} au programme` : "Épreuves à venir"}
                          sx={{ fontWeight: 800, bgcolor: `${PAL.cyan}26`, color: PAL.blueDeep }}
                        />
                        <Chip
                          size="small"
                          label={`${trialsWithResults} épreuve${trialsWithResults > 1 ? "s" : ""} classée${trialsWithResults > 1 ? "s" : ""}`}
                          sx={{ fontWeight: 800, bgcolor: `${PAL.green}22`, color: PAL.greenDeep }}
                        />
                      </Stack>
                      <Box
                        sx={{
                          mb: 1.4,
                          p: 1.15,
                          borderRadius: 2,
                          border: `1px solid ${stripe}44`,
                          bgcolor: `${stripe}0f`,
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 0.9,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>Début</Typography>
                          <Typography sx={{ fontSize: 13.5, color: INK, fontWeight: 800 }}>{formatDateOnly(startAt)}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>Fin</Typography>
                          <Typography sx={{ fontSize: 13.5, color: INK, fontWeight: 800 }}>{formatDateOnly(endAt)}</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: 14, color: INK_MUTED, lineHeight: 1.65, fontWeight: 500 }}>
                        {c.description
                          ? String(c.description).slice(0, 160) + (String(c.description).length > 160 ? "…" : "")
                          : "Consultez les tableaux officiels et les performances publiées, épreuve par épreuve."}
                      </Typography>
                      {hasResults ? (
                        <Button
                          onClick={() => goToCompetitionResults(navigate, c.competitionId)}
                          sx={{
                            mt: "auto",
                            alignSelf: "flex-end",
                            textTransform: "none",
                            borderRadius: 999,
                            fontWeight: 800,
                            px: 2.1,
                            py: 0.75,
                            color: "#fff",
                            background: `linear-gradient(92deg, ${PAL.blueDeep}, ${PAL.blue})`,
                            boxShadow: "0 8px 22px rgba(3,105,161,0.3)",
                            "&:hover": { background: `linear-gradient(92deg, ${PAL.blueDeep}, #0284c7)` },
                          }}
                        >
                          Consulter les résultats
                        </Button>
                      ) : null}
                    </CardContent>
                  </Box>
                </Card>
              );
              })}
            </Box>
            {list.length > COMPETITIONS_PER_PAGE && (
              <Box sx={{ mt: 3.2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  page={page}
                  count={totalPages}
                  onChange={(_, value) => setPage(value)}
                  shape="rounded"
                  variant="outlined"
                  color="primary"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                />
              </Box>
            )}
          </>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
