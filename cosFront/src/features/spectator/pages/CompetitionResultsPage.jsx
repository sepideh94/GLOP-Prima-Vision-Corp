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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import spectatorService from "../services/spectatorService";
import appTheme from "../../../common/theme/appTheme";

export default function CompetitionResultsPage() {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadCompetitionData();
  }, [competitionId]);

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

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "UPCOMING":
        return appTheme.colors.cyan;
      case "ONGOING":
        return appTheme.colors.green;
      case "COMPLETED":
        return appTheme.colors.violet;
      default:
        return appTheme.colors.textMuted;
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case "UPCOMING":
        return "À venir";
      case "ONGOING":
        return "En cours";
      case "COMPLETED":
        return "Terminé";
      default:
        return status || "Non défini";
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
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} separator="›">
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
        {competition.parentEventId && (
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/spectator/events/${competition.parentEventId}`)}
            sx={{
              color: appTheme.colors.cyan,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Événement
          </Link>
        )}
        <Typography color="text.primary">{competition.name}</Typography>
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
                }}
              >
                {competition.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={getStatusLabel(competition.status)}
            sx={{
              background: `${getStatusColor(competition.status)}20`,
              color: getStatusColor(competition.status),
              fontWeight: 600,
              border: `1px solid ${getStatusColor(competition.status)}40`,
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
              color: appTheme.colors.darkSoft,
              fontWeight: 600,
              "&.Mui-selected": {
                color: appTheme.colors.dark,
              },
            },
            "& .MuiTabs-indicator": {
              background: appTheme.colors.dark,
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
                color: appTheme.colors.dark,
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
                    color: appTheme.colors.dark,
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

                          {trial.mode && (
                            <Chip
                              label={trial.mode}
                              size="small"
                              sx={{
                                mt: 1,
                                background: `${appTheme.colors.cyan}20`,
                                color: appTheme.colors.cyan,
                              }}
                            />
                          )}
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
                color: appTheme.colors.dark,
              }}
            >
              Classements
            </Typography>

          <Card
            sx={{
              background: appTheme.gradients.card,
              borderRadius: appTheme.radius.lg,
              boxShadow: appTheme.shadows.card,
            }}
          >
            <CardContent>
              <Typography sx={{ color: appTheme.colors.textSecondary, textAlign: "center", py: 4 }}>
                Les classements seront disponibles une fois les épreuves terminées.
                <br />
                Revenez bientôt pour consulter les résultats !
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Back Button */}
      <Box sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (competition.parentEventId) {
              navigate(`/spectator/events/${competition.parentEventId}`);
            } else {
              navigate("/spectator");
            }
          }}
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
  );
}
