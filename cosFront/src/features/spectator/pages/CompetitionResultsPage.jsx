import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import spectatorService from "../services/spectatorService";
import appTheme from "../../../common/theme/appTheme";
import TrialResultsViewDialog from "../../trial/pages/TrialResultsViewDialog";
import {
  competitionStatusColor,
  competitionStatusLabel,
} from "../utils/competitionStatus";

export default function CompetitionResultsPage() {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [competitionResults, setCompetitionResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);

  useEffect(() => {
    loadCompetitionData();
  }, [competitionId]);

  useEffect(() => {
    if (tabValue !== 1 || resultsLoaded) return;
    loadCompetitionResults();
  }, [tabValue, resultsLoaded]);

  const loadCompetitionData = async () => {
    try {
      setLoading(true);
      const [competitionData, trialsData] = await Promise.all([
        spectatorService.getCompetitionById(competitionId),
        spectatorService.getTrialsByCompetition(competitionId),
      ]);
      setCompetition(competitionData);
      setTrials(trialsData || []);
    } catch (err) {
      setError("Impossible de charger les données. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompetitionResults = async () => {
    try {
      setResultsLoading(true);
      setResultsError(null);
      const data = await spectatorService.getCompetitionResults(competitionId);
      setCompetitionResults(Array.isArray(data) ? data : []);
      setResultsLoaded(true);
    } catch (err) {
      setResultsError("Impossible de charger les classements pour le moment.");
      console.error(err);
    } finally {
      setResultsLoading(false);
    }
  };

  const getTrialStatusColor = (trial) => {
    if (trial.cancelled) return appTheme.colors.textMuted;
    if (trial.hasEnded) return appTheme.colors.violet;
    if (trial.hasStarted) return appTheme.colors.green;
    return appTheme.colors.cyan;
  };

  const getTrialStatusLabel = (trial) => {
    if (trial.cancelled) return "Annulée";
    if (trial.hasEnded) return "Terminée";
    if (trial.hasStarted) return "En cours";
    return "À venir";
  };

  const isTrialCompleted = (trial) =>
    !trial?.cancelled &&
    (trial?.hasEnded || String(trial?.status || "").toUpperCase() === "COMPLETED");

  const openTrialResults = (trial) => {
    setSelectedTrial(trial);
    setResultsDialogOpen(true);
  };

  const prettifyEnum = (value) => {
    if (!value || typeof value !== "string") return "Non défini";
    return value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
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
      RELAY_4X100M_FREESTYLE: "Relais 4x100m nage libre",
      RELAY_4X200M_FREESTYLE: "Relais 4x200m nage libre",
      CENT_METRES: "100 mètres",
    };
    if (map[key]) return map[key];

    // Fallback générique pour traduire les enums anglais non mappés
    // ex: ONE_HUNDRED_M_BACKSTROKE -> 100m dos
    // ex: RELAY_4X100M_MEDLEY -> Relais 4x100m 4 nages
    const wordsToNumber = {
      FIFTY: "50",
      ONE_HUNDRED: "100",
      TWO_HUNDRED: "200",
      THREE_HUNDRED: "300",
      FOUR_HUNDRED: "400",
      FIVE_HUNDRED: "500",
      EIGHT_HUNDRED: "800",
      ONE_THOUSAND: "1000",
      ONE_THOUSAND_FIVE_HUNDRED: "1500",
    };

    let normalized = key;
    Object.entries(wordsToNumber).forEach(([wordKey, numberValue]) => {
      normalized = normalized.replace(wordKey, numberValue);
    });

    const tokenMap = {
      FREESTYLE: "nage libre",
      BACKSTROKE: "dos",
      BREASTSTROKE: "brasse",
      BUTTERFLY: "papillon",
      MEDLEY: "4 nages",
      RELAY: "Relais",
      MIXED: "mixte",
      MEN: "hommes",
      MALE: "hommes",
      WOMEN: "femmes",
      FEMALE: "femmes",
      OPEN: "open",
    };

    Object.entries(tokenMap).forEach(([en, frValue]) => {
      normalized = normalized.replace(new RegExp(`\\b${en}\\b`, "g"), frValue);
    });

    normalized = normalized
      .replace(/(\d+)_M\b/g, "$1m")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b(\d+)X(\d+)M\b/gi, (_, a, b) => `${a}x${b}m`);

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  // Grouper les épreuves par round
  const trialsByRound = trials.reduce((acc, trial) => {
    const roundName = trial.roundId
      ? `Round ${trial.roundNumber || "N/A"}`
      : "Sans round";
    if (!acc[roundName]) {
      acc[roundName] = [];
    }
    acc[roundName].push(trial);
    return acc;
  }, {});

  const trialsById = trials.reduce((acc, trial) => {
    acc[trial.id] = trial;
    return acc;
  }, {});

  const resultsByRound = competitionResults.reduce((acc, trialGroup) => {
    const trialMeta = trialsById[trialGroup.trialId];
    const hasTeamResults =
      Array.isArray(trialGroup.results) &&
      trialGroup.results.some(
        (r) => r?.participant?.competitorType === "TEAM"
      );
    const roundName = trialMeta?.roundId
      ? `Round ${trialMeta.roundNumber || "N/A"}`
      : "Sans round";

    if (!acc[roundName]) {
      acc[roundName] = [];
    }

    acc[roundName].push({
      ...trialGroup,
      displayTrialName:
        trialMeta?.name ||
        trialMeta?.trialName ||
        getTrialNameLabel(trialGroup.trialName),
      displayCategory: getGenderLabel(trialGroup.categoryGender),
      displayRound: trialMeta?.roundId
        ? `Round ${trialMeta.roundNumber || "N/A"}`
        : getRoundLabel(trialGroup.roundName),
      displayCompetitorMode:
        trialMeta?.mode === "TEAM" || hasTeamResults ? "Équipe" : "Individuel",
    });

    return acc;
  }, {});

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress sx={{ color: appTheme.colors.cyan }} />
      </Box>
    );
  }

  if (error || !competition) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || "Compétition introuvable"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/spectator")}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        maxWidth: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: "100%",
          p: { xs: 2, sm: 2.5, md: 4 },
          background: "rgba(15, 23, 42, 0.42)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: { xs: 2, md: 3 },
          boxShadow: "0 8px 32px rgba(2, 6, 23, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxSizing: "border-box",
        }}
      >
      {/* Breadcrumbs */}
      <Breadcrumbs
        sx={{
          mb: 3,
          "& .MuiBreadcrumbs-separator": { color: appTheme.colors.textMuted },
        }}
        separator="›"
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate("/spectator")}
          sx={{
            color: appTheme.colors.cyan,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Événements
        </Link>
        <Typography sx={{ color: appTheme.colors.textPrimary, fontWeight: 600 }}>
          {competition.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          background: appTheme.gradients.card,
          borderRadius: appTheme.radius.lg,
          boxShadow: appTheme.shadows.card,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                color: appTheme.colors.textPrimary,
              }}
            >
              {competition.name}
            </Typography>
            {competition.description && (
              <Typography
                sx={{
                  color: appTheme.colors.textSecondary,
                  fontSize: "1.1rem",
                  mb: 2,
                  maxWidth: "65ch",
                }}
              >
                {competition.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={competitionStatusLabel(competition.status, competition.statusLabel)}
            sx={{
              background: `${competitionStatusColor(competition.status)}20`,
              color: competitionStatusColor(competition.status),
              fontWeight: 600,
              border: `1px solid ${competitionStatusColor(competition.status)}40`,
            }}
          />
        </Box>

        {competition.startDate && (
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ color: appTheme.colors.cyan }} />
              <Typography sx={{ color: appTheme.colors.textSecondary }}>
                <strong>Début:</strong>{" "}
                {format(new Date(competition.startDate), "d MMMM yyyy à HH:mm", {
                  locale: fr,
                })}
              </Typography>
            </Box>
            {competition.endDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon sx={{ color: appTheme.colors.violet }} />
                <Typography sx={{ color: appTheme.colors.textSecondary }}>
                  <strong>Fin:</strong>{" "}
                  {format(new Date(competition.endDate), "d MMMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            "& .MuiTab-root": {
              color: appTheme.colors.textSecondary,
              fontWeight: 600,
              "&.Mui-selected": {
                color: appTheme.colors.cyan,
              },
            },
            "& .MuiTabs-indicator": {
              background: appTheme.colors.cyan,
            },
          }}
        >
          <Tab icon={<SportsScoreIcon />} iconPosition="start" label="Épreuves" />
          <Tab icon={<LeaderboardIcon />} iconPosition="start" label="Classements" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: appTheme.colors.textPrimary,
              }}
            >
              Épreuves ({trials.length})
            </Typography>

          {trials.length === 0 ? (
            <Card
              sx={{
                background: appTheme.gradients.card,
                borderRadius: appTheme.radius.lg,
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: appTheme.colors.textSecondary }}>
                Aucune épreuve disponible pour cette compétition.
              </Typography>
            </Card>
          ) : (
            Object.entries(trialsByRound).map(([roundName, roundTrials]) => (
              <Box key={roundName} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: appTheme.colors.textPrimary,
                  }}
                >
                  {roundName}
                </Typography>
                <Grid container spacing={3}>
                  {roundTrials.map((trial) => (
                    <Grid item xs={12} md={6} key={trial.id}>
                      <Card
                        sx={{
                          background: appTheme.gradients.card,
                          borderRadius: appTheme.radius.lg,
                          boxShadow: appTheme.shadows.card,
                          border: "1px solid rgba(148, 163, 184, 0.1)",
                          height: "100%",
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 2,
                            }}
                          >
                            <SportsScoreIcon
                              sx={{
                                fontSize: 32,
                                color: getTrialStatusColor(trial),
                              }}
                            />
                            <Chip
                              label={getTrialStatusLabel(trial)}
                              size="small"
                              sx={{
                                background: `${getTrialStatusColor(trial)}20`,
                                color: getTrialStatusColor(trial),
                                fontWeight: 600,
                                border: `1px solid ${getTrialStatusColor(trial)}40`,
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              mb: 1,
                              color: appTheme.colors.textPrimary,
                            }}
                          >
                            {trial.name || trial.trialName}
                          </Typography>

                          {trial.description && (
                            <Typography
                              sx={{
                                color: appTheme.colors.textSecondary,
                                fontSize: "0.875rem",
                                mb: 2,
                              }}
                            >
                              {trial.description}
                            </Typography>
                          )}

                          {trial.startDate && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mt: 2,
                                pt: 2,
                                borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                              }}
                            >
                              <CalendarTodayIcon
                                sx={{ fontSize: 16, color: appTheme.colors.textMuted }}
                              />
                              <Typography
                                sx={{
                                  color: appTheme.colors.textMuted,
                                  fontSize: "0.8125rem",
                                }}
                              >
                                {format(new Date(trial.startDate), "d MMM yyyy", {
                                  locale: fr,
                                })}
                                {trial.startHour &&
                                  ` à ${format(new Date(`2000-01-01T${trial.startHour}`), "HH:mm")}`}
                              </Typography>
                            </Box>
                          )}

                          <Box
                            sx={{
                              mt: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            {trial.mode ? (
                              <Chip
                                label={trial.mode}
                                size="small"
                                sx={{
                                  background: `${appTheme.colors.cyan}20`,
                                  color: appTheme.colors.cyan,
                                }}
                              />
                            ) : (
                              <Box />
                            )}

                            {isTrialCompleted(trial) && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  borderRadius: appTheme.radius.pill,
                                  background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
                                  color: appTheme.colors.dark,
                                  boxShadow: "0 8px 20px rgba(34, 211, 238, 0.35)",
                                  px: 2,
                                  py: 0.7,
                                  "&:hover": {
                                    background: "linear-gradient(135deg, #06B6D4, #2563EB)",
                                    boxShadow: "0 10px 24px rgba(59, 130, 246, 0.35)",
                                  },
                                }}
                                onClick={() => openTrialResults(trial)}
                              >
                                Résultats
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: appTheme.colors.textPrimary,
            }}
          >
            Classements
          </Typography>

          {resultsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: appTheme.colors.cyan }} />
            </Box>
          ) : resultsError ? (
            <Alert severity="error">{resultsError}</Alert>
          ) : competitionResults.length === 0 ? (
            <Card
              sx={{
                background: appTheme.gradients.card,
                borderRadius: appTheme.radius.lg,
                boxShadow: appTheme.shadows.card,
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    color: appTheme.colors.textSecondary,
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Aucun classement disponible pour cette compétition.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={3}>
              {Object.entries(resultsByRound).map(([roundName, roundGroups]) => (
                <Box key={roundName}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      mb: 1.6,
                      color: appTheme.colors.textPrimary,
                    }}
                  >
                    {roundName}
                  </Typography>
                  <Stack spacing={2.2}>
                    {roundGroups.map((trialGroup) => {
                const results = Array.isArray(trialGroup.results)
                  ? trialGroup.results
                  : [];
                const resultsCount = results.length;
                const performanceType = results[0]?.performanceType || null;
                const performanceLabel =
                  performanceType === "TIME"
                    ? "Temps"
                    : performanceType === "POINTS"
                    ? "Points"
                    : "Performance";
                const lastUpdated = results.find((r) => r?.updatedAt) || null;

                return (
                <Card
                  key={trialGroup.trialId}
                  sx={{
                    background:
                      "linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(10,20,52,0.96) 58%, rgba(30,27,75,0.95) 100%)",
                    borderRadius: appTheme.radius.lg,
                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.38)",
                    border: "1px solid rgba(56, 189, 248, 0.20)",
                    overflow: "hidden",
                  }}
                >
                  <CardContent sx={{ p: 2.6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1.2,
                        flexWrap: "wrap",
                        pb: 1.6,
                        borderBottom: "1px solid rgba(148, 163, 184, 0.24)",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: "#E2E8F0",
                            letterSpacing: "0.01em",
                            fontSize: "1.05rem",
                          }}
                        >
                          {trialGroup.displayTrialName || `Épreuve ${trialGroup.trialId}`}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.9 }}>
                          <Chip
                            size="small"
                            label={trialGroup.displayCategory}
                            sx={{
                              fontWeight: 700,
                              background: "rgba(34, 211, 238, 0.16)",
                              color: "#67E8F9",
                              border: "1px solid rgba(34, 211, 238, 0.40)",
                            }}
                          />
                          {trialGroup.displayRound && (
                            <Chip
                              size="small"
                              label={trialGroup.displayRound}
                              sx={{
                                fontWeight: 700,
                                background: "rgba(167, 139, 250, 0.17)",
                                color: "#DDD6FE",
                                border: "1px solid rgba(167, 139, 250, 0.42)",
                              }}
                            />
                          )}
                          <Chip
                            size="small"
                            label={trialGroup.displayCompetitorMode}
                            sx={{
                              fontWeight: 700,
                              background: "rgba(167, 139, 250, 0.17)",
                              color: "#DDD6FE",
                              border: "1px solid rgba(167, 139, 250, 0.42)",
                            }}
                          />
                          <Chip
                            size="small"
                            label={`${performanceLabel}`}
                            sx={{
                              fontWeight: 700,
                              background: "rgba(134, 239, 172, 0.14)",
                              color: "#BBF7D0",
                              border: "1px solid rgba(134, 239, 172, 0.36)",
                            }}
                          />
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        label={`${resultsCount} résultat${resultsCount > 1 ? "s" : ""}`}
                        sx={{
                          fontWeight: 800,
                          background: "rgba(59,130,246,0.18)",
                          color: "#BFDBFE",
                          border: "1px solid rgba(59,130,246,0.42)",
                        }}
                      />
                    </Box>

                      <Box
                        sx={{
                          mt: 1.2,
                          mb: 1.6,
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography sx={{ color: "rgba(226,232,240,0.78)", fontSize: "0.82rem" }}>
                          Classement officiel de l'épreuve
                        </Typography>
                        <Typography sx={{ color: "rgba(226,232,240,0.72)", fontSize: "0.8rem" }}>
                          {lastUpdated?.updatedAt
                            ? `Mise à jour: ${new Date(lastUpdated.updatedAt).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : "Mise à jour: non disponible"}
                        </Typography>
                      </Box>

                      {resultsCount === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.2,
                            borderRadius: 3,
                            border: "1px dashed rgba(148, 163, 184, 0.34)",
                            background: "rgba(15, 23, 42, 0.32)",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "rgba(226,232,240,0.92)",
                              fontSize: "0.92rem",
                              textAlign: "center",
                              fontWeight: 600,
                            }}
                          >
                            Aucun résultat enregistré pour cette épreuve.
                          </Typography>
                        </Paper>
                      ) : (
                        <TableContainer
                          component={Paper}
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: "1px solid rgba(148, 163, 184, 0.20)",
                            overflow: "hidden",
                            background: "rgba(2, 6, 23, 0.35)",
                          }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{
                                    fontWeight: 800,
                                    background: "rgba(30, 41, 59, 0.85)",
                                    color: "#E2E8F0",
                                  }}
                                >
                                  Rang
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 800,
                                    background: "rgba(30, 41, 59, 0.85)",
                                    color: "#E2E8F0",
                                  }}
                                >
                                  Participant
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 800,
                                    background: "rgba(30, 41, 59, 0.85)",
                                    color: "#E2E8F0",
                                  }}
                                >
                                  Performance
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {results.map((result) => (
                                <TableRow
                                  key={result.id}
                                  sx={
                                    result.tie
                                      ? {
                                          background: "rgba(250, 204, 21, 0.14)",
                                          "&:hover": {
                                            background: "rgba(250, 204, 21, 0.18)",
                                          },
                                        }
                                      : {
                                          "&:hover": {
                                            background: "rgba(148, 163, 184, 0.10)",
                                          },
                                        }
                                  }
                                >
                                  <TableCell sx={{ color: "#E2E8F0" }}>
                                    <Typography sx={{ fontWeight: 700 }}>
                                      {result.rank === 1
                                        ? "🥇"
                                        : result.rank === 2
                                        ? "🥈"
                                        : result.rank === 3
                                        ? "🥉"
                                        : result.rank}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ color: "#E2E8F0" }}>
                                    <Typography sx={{ fontWeight: 600 }}>
                                      {result.participant?.displayName || "Participant inconnu"}
                                    </Typography>
                                    {result.participant?.competitorType === "TEAM" &&
                                      Array.isArray(result.participant?.members) &&
                                      result.participant.members.length > 0 && (
                                        <Typography
                                          sx={{
                                            color: "rgba(226,232,240,0.72)",
                                            fontSize: "0.8125rem",
                                          }}
                                        >
                                          {result.participant.members
                                            .map((member) =>
                                              `${member.firstName || ""} ${member.lastName || ""}`.trim()
                                            )
                                            .filter(Boolean)
                                            .join(", ")}
                                        </Typography>
                                      )}
                                  </TableCell>
                                  <TableCell sx={{ color: "#E2E8F0" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Typography sx={{ fontWeight: 800 }}>
                                        {result.performance}
                                      </Typography>
                                      {result.tie && (
                                        <Chip
                                          size="small"
                                          label="Ex æquo"
                                          sx={{
                                            fontWeight: 700,
                                            color: "#FFF7ED",
                                            background: "rgba(249, 115, 22, 0.28)",
                                            border: "1px solid rgba(249, 115, 22, 0.55)",
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                  </CardContent>
                </Card>
                );
              })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Back Button */}
      <Box sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/spectator")}
          sx={{
            color: appTheme.colors.cyan,
            "&:hover": {
              background: `${appTheme.colors.cyan}20`,
            },
          }}
        >
          Retour
        </Button>
      </Box>

      </Box>

      <TrialResultsViewDialog
        open={resultsDialogOpen}
        onClose={() => {
          setResultsDialogOpen(false);
          setSelectedTrial(null);
        }}
        trial={selectedTrial}
      />
    </Box>
  );
}
