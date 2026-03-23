import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  IconButton,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import appTheme from "../../../common/theme/appTheme";
import publicResultsService from "../services/publicResultsService";
import PublicNavbar from "../../../common/components/PublicNavbar";
import Footer from "../../../common/components/Footer";

const COMPETITIONS_PER_PAGE = 8;
const TRIALS_PER_PAGE = 5;

export default function PublicResultsPage() {
  const navigate = useNavigate();
  const [availableCompetitions, setAvailableCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
  const [resultsByTrial, setResultsByTrial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [competitionPage, setCompetitionPage] = useState(1);
  const [trialPage, setTrialPage] = useState(1);

  const sanitizeTrialGroups = (groups) =>
    (Array.isArray(groups) ? groups : [])
      .map((trialGroup) => {
        const results = Array.isArray(trialGroup?.results) ? trialGroup.results : [];
        const validResults = results.filter((result) => {
          const hasPerformance =
            result?.performance !== null &&
            result?.performance !== undefined &&
            String(result.performance).trim() !== "";
          const isForfeit = result?.participant?.status === "FORFEIT";
          return hasPerformance || isForfeit;
        });
        if (validResults.length === 0) return null;
        return {
          ...trialGroup,
          results: validResults,
        };
      })
      .filter(Boolean);

  const fetchDiscovery = async () => {
    try {
      setLoading(true);
      setError(null);
      const discovered = await publicResultsService.getCompetitionsWithResults();
      const normalizedDiscovered = (Array.isArray(discovered) ? discovered : []).map((competition) => ({
        ...competition,
        trialGroups: sanitizeTrialGroups(competition?.trialGroups),
      }));
      setAvailableCompetitions(normalizedDiscovered);
      setCompetitionPage(1);

      const pendingIdRaw = sessionStorage.getItem("ciblorga_public_competition_id");
      const pendingId = pendingIdRaw != null && pendingIdRaw !== "" ? Number(pendingIdRaw) : null;
      if (pendingId != null && !Number.isNaN(pendingId)) {
        sessionStorage.removeItem("ciblorga_public_competition_id");
        const match = normalizedDiscovered.find((c) => Number(c.competitionId) === pendingId);
        if (match) {
          setSelectedCompetitionId(match.competitionId);
          setResultsByTrial(Array.isArray(match?.trialGroups) ? match.trialGroups : []);
          setTrialPage(1);
          return;
        }
      }

      if (normalizedDiscovered.length > 0) {
        const first = normalizedDiscovered[0];
        setSelectedCompetitionId(first.competitionId);
        setResultsByTrial(Array.isArray(first?.trialGroups) ? first.trialGroups : []);
        setTrialPage(1);
      } else {
        setSelectedCompetitionId(null);
        setResultsByTrial([]);
        setTrialPage(1);
      }
    } catch (e) {
      setAvailableCompetitions([]);
      setSelectedCompetitionId(null);
      setResultsByTrial([]);
      setError(
        e?.response?.data?.message ||
          "Impossible de charger les classements publics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscovery();
  }, []);

  const handleSelectCompetition = async (competitionId) => {
    setSelectedCompetitionId(competitionId);
    const selected = availableCompetitions.find((x) => x.competitionId === competitionId);
    if (selected) {
      setResultsByTrial(Array.isArray(selected.trialGroups) ? selected.trialGroups : []);
      setTrialPage(1);
      return;
    }
    try {
      setLoading(true);
      const data = await publicResultsService.getCompetitionResults(competitionId);
      setResultsByTrial(sanitizeTrialGroups(data));
      setTrialPage(1);
    } catch {
      setResultsByTrial([]);
      setError("Impossible de charger cette compétition pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const totalResults = useMemo(
    () =>
      resultsByTrial.reduce((sum, trialGroup) => {
        const count = Array.isArray(trialGroup?.results) ? trialGroup.results.length : 0;
        return sum + count;
      }, 0),
    [resultsByTrial]
  );

  const sortedResultsByTrial = useMemo(() => {
    const toDate = (value) => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const resolveTrialDate = (trialGroup) => {
      const endFromSplit =
        trialGroup?.endDate && trialGroup?.endHour
          ? toDate(`${trialGroup.endDate}T${trialGroup.endHour}`)
          : null;
      const startFromSplit =
        trialGroup?.startDate && trialGroup?.startHour
          ? toDate(`${trialGroup.startDate}T${trialGroup.startHour}`)
          : null;
      const endFromIso =
        toDate(trialGroup?.endTime) ||
        toDate(trialGroup?.trialEndTime) ||
        toDate(trialGroup?.scheduledEndTime);
      const startFromIso =
        toDate(trialGroup?.startTime) ||
        toDate(trialGroup?.trialStartTime) ||
        toDate(trialGroup?.scheduledStartTime);

      const latestResultUpdate = (Array.isArray(trialGroup?.results) ? trialGroup.results : [])
        .map((r) => toDate(r?.updatedAt))
        .filter(Boolean)
        .sort((a, b) => b - a)[0];

      return endFromSplit || endFromIso || startFromSplit || startFromIso || latestResultUpdate || null;
    };

    return [...resultsByTrial].sort((a, b) => {
      const dateA = resolveTrialDate(a);
      const dateB = resolveTrialDate(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  }, [resultsByTrial]);

  const selectedCompetitionName = useMemo(
    () =>
      availableCompetitions.find((c) => c.competitionId === selectedCompetitionId)?.competitionName ||
      null,
    [availableCompetitions, selectedCompetitionId]
  );

  const totalCompetitionPages = Math.max(1, Math.ceil(availableCompetitions.length / COMPETITIONS_PER_PAGE));
  const pagedCompetitions = useMemo(() => {
    const start = (competitionPage - 1) * COMPETITIONS_PER_PAGE;
    return availableCompetitions.slice(start, start + COMPETITIONS_PER_PAGE);
  }, [availableCompetitions, competitionPage]);

  const totalTrialPages = Math.max(1, Math.ceil(sortedResultsByTrial.length / TRIALS_PER_PAGE));
  const pagedResultsByTrial = useMemo(() => {
    const start = (trialPage - 1) * TRIALS_PER_PAGE;
    return sortedResultsByTrial.slice(start, start + TRIALS_PER_PAGE);
  }, [sortedResultsByTrial, trialPage]);

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };
  const withDisplayRank = (rows) =>
    rows.map((row, index, arr) => {
      if (index === 0) return { ...row, displayRank: 1 };
      const prev = arr[index - 1];
      const isSameRankAsPrev =
        row?.rank != null && prev?.rank != null && row.rank === prev.rank;
      return {
        ...row,
        displayRank: isSameRankAsPrev ? prev.displayRank : index + 1,
      };
    });

  const prettifyEnum = (value) => {
    if (!value || typeof value !== "string") return "Non défini";
    return value
      .toLowerCase()
      .replaceAll("_", " ")
      .replaceAll(/\s+/g, " ")
      .trim()
      .replaceAll(/\b\w/g, (c) => c.toUpperCase());
  };

  const getGenderLabel = (value) => {
    const key = String(value || "").toUpperCase();
    if (key === "MALE" || key === "MEN") return "Homme";
    if (key === "FEMALE" || key === "WOMEN") return "Femme";
    if (key === "MIXED") return "Mixte";
    return prettifyEnum(value);
  };

  const getRoundLabel = (value) => {
    const key = String(value || "").toUpperCase();
    const map = {
      QUALIFICATION_HEAT: "Série de qualification",
      QUALIFICATION: "Qualification",
      SEMI_FINAL: "Demi-finale",
      FINAL: "Finale",
      FINALE: "Finale",
      HEAT: "Série",
    };
    return map[key] || prettifyEnum(value);
  };

  const getTrialNameLabel = (value) => {
    const key = String(value || "").toUpperCase();
    const map = {
      FIFTY_M_FREESTYLE: "50m nage libre",
      ONE_HUNDRED_M_FREESTYLE: "100m nage libre",
      TWO_HUNDRED_M_FREESTYLE: "200m nage libre",
      FIVE_HUNDRED_M_FREESTYLE: "500m nage libre",
      FIFTY_M_BUTTERFLY: "50m papillon",
      ONE_HUNDRED_M_BUTTERFLY: "100m papillon",
      TWO_HUNDRED_M_BUTTERFLY: "200m papillon",
      FIFTY_M_BACKSTROKE: "50m dos",
      ONE_HUNDRED_M_BACKSTROKE: "100m dos",
      TWO_HUNDRED_M_BACKSTROKE: "200m dos",
      FIFTY_M_BREASTSTROKE: "50m brasse",
      ONE_HUNDRED_M_BREASTSTROKE: "100m brasse",
      TWO_HUNDRED_M_BREASTSTROKE: "200m brasse",
      TWO_HUNDRED_M_MEDLEY: "200m 4 nages",
      FOUR_HUNDRED_M_MEDLEY: "400m 4 nages",
      RELAY_4X100M_FREESTYLE: "Relais 4x100m nage libre",
      RELAY_4X200M_FREESTYLE: "Relais 4x200m nage libre",
      RELAY_4X100M_MEDLEY: "Relais 4x100m 4 nages",
      CENT_METRES: "100 mètres",
    };
    return map[key] || prettifyEnum(value);
  };

  const getFrenchTrialLabelFromText = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return null;

    const key = raw.toUpperCase().replace(/\s+/g, " ").trim();
    const textMap = {
      "FIFTY M FREESTYLE": "50m nage libre",
      "ONE HUNDRED M FREESTYLE": "100m nage libre",
      "TWO HUNDRED M FREESTYLE": "200m nage libre",
      "FIVE HUNDRED M FREESTYLE": "500m nage libre",
      "FIFTY M BUTTERFLY": "50m papillon",
      "ONE HUNDRED M BUTTERFLY": "100m papillon",
      "TWO HUNDRED M BUTTERFLY": "200m papillon",
      "FIFTY M BACKSTROKE": "50m dos",
      "ONE HUNDRED M BACKSTROKE": "100m dos",
      "TWO HUNDRED M BACKSTROKE": "200m dos",
      "FIFTY M BREASTSTROKE": "50m brasse",
      "ONE HUNDRED M BREASTSTROKE": "100m brasse",
      "TWO HUNDRED M BREASTSTROKE": "200m brasse",
      "TWO HUNDRED M MEDLEY": "200m 4 nages",
      "FOUR HUNDRED M MEDLEY": "400m 4 nages",
    };

    return textMap[key] || null;
  };

  const getDisplayTrialName = (trialGroup) => {
    const customName =
      trialGroup?.trialDisplayName ||
      trialGroup?.customTrialName ||
      trialGroup?.displayName ||
      trialGroup?.name;

    if (customName && String(customName).trim()) {
      const frenchFromText = getFrenchTrialLabelFromText(customName);
      return frenchFromText || customName;
    }

    return getTrialNameLabel(trialGroup?.trialName) || `Épreuve ${trialGroup?.trialId}`;
  };

  const formatDateTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeTime = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    return raw.length >= 5 ? raw.slice(0, 5) : raw;
  };

  const formatDateAndHour = (dateValue, hourValue) => {
    if (!dateValue || !hourValue) return null;
    const date = new Date(`${dateValue}T${hourValue}`);
    if (Number.isNaN(date.getTime())) return `${dateValue} ${normalizeTime(hourValue)}`;
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          backgroundImage: `url(${import.meta.env.BASE_URL}images/home/feature-classement.jpg?v=20250324e)`,
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
          background:
            "linear-gradient(165deg, rgba(224,242,254,0.72) 0%, rgba(255,255,255,0.9) 38%, rgba(237,233,254,0.62) 100%)",
          zIndex: 0,
        },
      }}
    >
      <PublicNavbar themeVariant="darkHome" />
      <Box sx={{ flex: 1, pt: "84px", pb: 5, position: "relative", zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
                sx={{
                  color: "#0f172a",
                  textTransform: "none",
                  fontWeight: 900,
                  px: 2.2,
                  py: 0.9,
                  borderRadius: appTheme.radius.pill,
                  border: "1px solid rgba(14,165,233,0.3)",
                  background: "rgba(255,255,255,0.88)",
                  "&:hover": { background: "rgba(255,255,255,1)" },
                }}
              >
                Accueil
              </Button>
              <Button
                onClick={() => navigate("/competitions")}
                sx={{
                  color: "#0f172a",
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2,
                  py: 0.9,
                  borderRadius: appTheme.radius.pill,
                  border: "1px solid rgba(167,139,250,0.36)",
                  background: "rgba(255,255,255,0.88)",
                  "&:hover": { background: "rgba(255,255,255,1)" },
                }}
              >
                Compétitions
              </Button>
            </Stack>
          <IconButton
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{ color: "#0f172a", background: "rgba(255,255,255,0.88)" }}
          >
            <ArrowForwardIcon sx={{ transform: "rotate(-90deg)" }} />
          </IconButton>
        </Box>

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            background: "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
            border: "1px solid rgba(148,163,184,0.2)",
            boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
              <EmojiEventsIcon sx={{ color: appTheme.colors.violet }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                Résultats & Classements publics
              </Typography>
            </Box>
            <Typography sx={{ color: "#475569", mb: 1.2 }}>
              Explorez les classements officiels des dernières compétitions
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {pagedCompetitions.map((competition) => (
                <Chip
                  key={competition.competitionId}
                  label={
                    competition.competitionName ||
                    `Compétition ${competition.competitionId}`
                  }
                  clickable
                  onClick={() => handleSelectCompetition(competition.competitionId)}
                  sx={{
                    fontWeight: 800,
                    borderRadius: appTheme.radius.pill,
                    background:
                      selectedCompetitionId === competition.competitionId
                        ? "linear-gradient(135deg, #22D3EE, #3B82F6)"
                        : "rgba(241,245,249,0.95)",
                    color:
                      selectedCompetitionId === competition.competitionId
                        ? "#08101f"
                        : "#0f172a",
                    border:
                      selectedCompetitionId === competition.competitionId
                        ? "none"
                        : "1px solid rgba(148,163,184,0.28)",
                  }}
                />
              ))}
            </Stack>
            {availableCompetitions.length > COMPETITIONS_PER_PAGE && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  page={competitionPage}
                  count={totalCompetitionPages}
                  onChange={(_, page) => setCompetitionPage(page)}
                  color="primary"
                  shape="rounded"
                  size="small"
                  variant="outlined"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                />
              </Box>
            )}
            {availableCompetitions.length === 0 && !loading && !error && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucune compétition avec classement public détectée pour le moment.
              </Alert>
            )}
          </CardContent>
        </Card>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: appTheme.colors.cyan }} />
          </Box>
        )}

        {!loading && error && (
          <Box>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && (
          <Stack spacing={2.2}>
            <Typography sx={{ color: "#475569", fontWeight: 700 }}>
              {resultsByTrial.length} épreuve(s) · {totalResults} résultat(s)
            </Typography>

            {pagedResultsByTrial.map((trialGroup, idx) => {
              const results = Array.isArray(trialGroup?.results) ? trialGroup.results : [];
              const rankedRows = withDisplayRank(
                results.filter((r) => r?.participant?.status !== "FORFEIT")
              );
              const displayResults = [
                ...rankedRows,
                ...results
                  .filter((r) => r?.participant?.status === "FORFEIT")
                  .map((r) => ({ ...r, rank: null, tie: false, displayRank: null })),
              ];
              const hasTeam = results.some((r) => r?.participant?.competitorType === "TEAM");
              const modeLabel = hasTeam ? "Équipe" : "Individuel";
              const performanceType = results[0]?.performanceType || null;
              const accent = [appTheme.colors.cyan, appTheme.colors.violet, appTheme.colors.green][idx % 3];
              const performanceLabel =
                performanceType === "TIME"
                  ? "Temps"
                  : performanceType === "POINTS"
                    ? "Points"
                    : "Performance";

              return (
                <Card
                  key={trialGroup?.trialId}
                  sx={{
                    borderRadius: 3,
                    background: "#ffffff",
                    border: `1px solid ${accent}44`,
                    boxShadow: `0 10px 26px rgba(15, 23, 42, 0.08), 0 0 0 1px ${accent}18`,
                  }}
                >
                  <Box sx={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${appTheme.colors.blue}, ${appTheme.colors.cyan})` }} />
                  <CardContent>
                    <Box
                      sx={{
                        mb: 1.6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 900, fontSize: 17, color: "#0f172a" }}>
                          {getDisplayTrialName(trialGroup)}
                        </Typography>
                        {selectedCompetitionId && selectedCompetitionName && (
                          <Typography sx={{ color: "#0369a1", fontSize: 12, mb: 0.3, fontWeight: 700 }}>
                            {selectedCompetitionName}
                          </Typography>
                        )}
                        <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                          {trialGroup?.roundDisplayName || getRoundLabel(trialGroup?.roundName || "ROUND")}
                          {trialGroup?.categoryGender
                            ? ` · ${getGenderLabel(trialGroup?.categoryGender)}`
                            : ""}
                        </Typography>
                        {(trialGroup?.startDate ||
                          trialGroup?.startHour ||
                          trialGroup?.endDate ||
                          trialGroup?.endHour ||
                          trialGroup?.startTime ||
                          trialGroup?.trialStartTime ||
                          trialGroup?.scheduledStartTime ||
                          trialGroup?.endTime ||
                          trialGroup?.trialEndTime ||
                          trialGroup?.scheduledEndTime) && (
                          <Typography sx={{ color: "#64748b", fontSize: 12, mt: 0.4 }}>
                            {formatDateTime(
                              trialGroup?.startDate && trialGroup?.startHour
                                ? `${trialGroup.startDate}T${trialGroup.startHour}`
                                : trialGroup?.startTime ||
                                  trialGroup?.trialStartTime ||
                                  trialGroup?.scheduledStartTime
                            ) ||
                            formatDateAndHour(trialGroup?.startDate, trialGroup?.startHour)
                              ? `Début: ${
                                  formatDateAndHour(
                                    trialGroup?.startDate,
                                    trialGroup?.startHour
                                  ) ||
                                  formatDateTime(
                                    trialGroup?.startTime ||
                                      trialGroup?.trialStartTime ||
                                      trialGroup?.scheduledStartTime
                                  )
                                }`
                              : ""}
                            {formatDateAndHour(trialGroup?.endDate, trialGroup?.endHour) ||
                            formatDateTime(
                              trialGroup?.endTime ||
                                trialGroup?.trialEndTime ||
                                trialGroup?.scheduledEndTime
                            )
                              ? `${
                                  formatDateAndHour(
                                    trialGroup?.startDate,
                                    trialGroup?.startHour
                                  ) ||
                                  formatDateTime(
                                    trialGroup?.startTime ||
                                      trialGroup?.trialStartTime ||
                                      trialGroup?.scheduledStartTime
                                  )
                                    ? " · "
                                    : ""
                                }Fin: ${
                                  formatDateAndHour(
                                    trialGroup?.endDate,
                                    trialGroup?.endHour
                                  ) ||
                                  formatDateTime(
                                    trialGroup?.endTime ||
                                      trialGroup?.trialEndTime ||
                                      trialGroup?.scheduledEndTime
                                  )
                                }`
                              : ""}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={modeLabel}
                          size="small"
                          sx={{ background: "rgba(167,139,250,0.18)", color: "#5b21b6", fontWeight: 700 }}
                        />
                        <Chip
                          label={performanceLabel}
                          size="small"
                          sx={{ background: "rgba(34,211,238,0.18)", color: "#0c4a6e", fontWeight: 700 }}
                        />
                      </Stack>
                    </Box>

                    {results.length === 0 ? (
                      <Typography sx={{ color: "#64748b" }}>
                        Aucun résultat enregistré pour cette épreuve.
                      </Typography>
                    ) : (
                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{ borderRadius: 2, background: "#f8fafc", border: "1px solid rgba(148,163,184,0.2)" }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 900, color: "#0f172a" }}>Rang</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: "#0f172a" }}>Participant</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: "#0f172a" }}>Performance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {displayResults.map((result) => {
                              const members = Array.isArray(result?.participant?.members)
                                ? result.participant.members
                                : [];
                              const isTeam = result?.participant?.competitorType === "TEAM";
                              const isForfeit = result?.participant?.status === "FORFEIT";

                              return (
                                <TableRow key={result.id}>
                                  <TableCell sx={{ width: 76 }}>
                                    <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                                      {result.displayRank == null ? "—" : getMedal(result.displayRank)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                                      {result?.participant?.displayName || "Participant inconnu"}
                                    </Typography>
                                    {isForfeit && (
                                      <Chip
                                        label="Forfait"
                                        size="small"
                                        sx={{
                                          mt: 0.6,
                                          fontWeight: 700,
                                          color: "#fecaca",
                                          background: "rgba(239, 68, 68, 0.20)",
                                          border: "1px solid rgba(239, 68, 68, 0.45)",
                                        }}
                                      />
                                    )}
                                    {isTeam && members.length > 0 && (
                                      <Typography
                                        sx={{
                                          mt: 0.3,
                                          fontSize: "0.8rem",
                                          color: "#64748b",
                                        }}
                                      >
                                        {members
                                          .map(
                                            (m) =>
                                              `${m?.firstName || ""} ${m?.lastName || ""}`.trim()
                                          )
                                          .filter(Boolean)
                                          .join(", ")}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Typography
                                        sx={{
                                          fontWeight: 900,
                                          color: isForfeit ? "#ef4444" : "#0f172a",
                                        }}
                                      >
                                        {isForfeit ? "Forfait" : result.performance}
                                      </Typography>
                                      {result.tie && !isForfeit && (
                                        <Chip label="Ex æquo" size="small" color="warning" />
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {sortedResultsByTrial.length > TRIALS_PER_PAGE && (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
                <Pagination
                  page={trialPage}
                  count={totalTrialPages}
                  onChange={(_, page) => setTrialPage(page)}
                  color="primary"
                  shape="rounded"
                  variant="outlined"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                />
              </Box>
            )}
          </Stack>
        )}
      </Container>
      </Box>
      <Footer />
    </Box>
  );
}
