import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import scheduleService from "../../schedule/services/scheduleService";

const PHASE_LABELS = {
  QUALIFICATION_HEAT: "Qualification",
  SEMI_FINAL: "Demi-finale",
  FINAL: "Finale",
};

const STATUS_LABELS = {
  UPCOMING: "À venir",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

const STATUS_COLORS = {
  UPCOMING: "#f59e0b",
  IN_PROGRESS: "#22d3ee",
  COMPLETED: "#16a34a",
  CANCELLED: "#ef4444",
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AthleteSchedulePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (competitionId) {
      loadSchedule();
    }
  }, [competitionId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getAthleteSchedule(competitionId);
      // Trier par date de début
      const sorted = data.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
      setSchedule(sorted);
    } catch (err) {
      console.error("Erreur lors du chargement du planning:", err);
      if (err.response?.status === 404) {
        setError("Compétition non trouvée");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas accès à ce planning");
      } else {
        setError(
          err.response?.data?.message || "Erreur lors du chargement du planning"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        background: appTheme.gradients.page,
        minHeight: "100vh",
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/athlete")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1.1,
          borderRadius: appTheme.radius.pill,
          background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
          color: appTheme.colors.dark,
        }}
      >
        Retour
      </Button>

      <Typography
        sx={{
          fontSize: 32,
          fontWeight: 900,
          color: appTheme.colors.dark,
          letterSpacing: "-0.5px",
          mb: 1,
        }}
      >
        Mon Planning
      </Typography>

      {schedule.length > 0 && (
        <Typography
          sx={{
            fontSize: 15,
            color: appTheme.colors.textMuted,
            mb: 4,
          }}
        >
          {schedule[0]?.competitionName}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : schedule.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: appTheme.radius.lg,
            background: appTheme.colors.darkSoft,
            textAlign: "center",
          }}
        >
          <Typography color={appTheme.colors.textMuted}>
            Aucune épreuve trouvée pour cette compétition
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {schedule.map((trial) => (
            <Grid item xs={12} md={6} key={trial.trialId}>
              <Card
                sx={{
                  borderRadius: appTheme.radius.lg,
                  boxShadow: appTheme.shadows.card,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: appTheme.shadows.cardHover,
                  },
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
                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: appTheme.colors.dark,
                        flex: 1,
                      }}
                    >
                      {trial.trialName}
                    </Typography>
                    <Chip
                      label={STATUS_LABELS[trial.trialStatus] || trial.trialStatus}
                      size="small"
                      sx={{
                        backgroundColor: `${STATUS_COLORS[trial.trialStatus] || "#6b7280"}20`,
                        color: STATUS_COLORS[trial.trialStatus] || "#6b7280",
                        fontWeight: 700,
                        ml: 1,
                      }}
                    />
                  </Box>

                  <Chip
                    label={PHASE_LABELS[trial.phase] || trial.phase}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(34, 211, 238, 0.15)",
                      color: appTheme.colors.dark,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 18, color: appTheme.colors.textMuted }}
                      />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: appTheme.colors.textMuted,
                        }}
                      >
                        <strong>Début:</strong> {formatDateTime(trial.startTime)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 18, color: appTheme.colors.textMuted }}
                      />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: appTheme.colors.textMuted,
                        }}
                      >
                        <strong>Fin:</strong> {formatDateTime(trial.endTime)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <LocationOnIcon
                        sx={{ fontSize: 18, color: appTheme.colors.textMuted, mt: 0.5 }}
                      />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: appTheme.colors.textMuted,
                        }}
                      >
                        <strong>Lieu:</strong> {trial.siteAddress}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
