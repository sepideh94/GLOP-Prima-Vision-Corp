import { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import scheduleService from "../../schedule/services/scheduleService";
import athleteTrialService from "../services/athleteTrialService";
import athleteService from "../../participant/services/athleteService";
import AthleteTrialResultsDialog from "../components/AthleteTrialResultsDialog";

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

const PARTICIPANT_STATUS_LABELS = {
  ACTIVE: "Inscrit",
  FORFEIT: "Forfait déclaré",
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
  const [athleteResults, setAthleteResults] = useState(null);
  const [competitorResults, setCompetitorResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [competitorsLoadError, setCompetitorsLoadError] = useState(null);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [openResultsDialog, setOpenResultsDialog] = useState(false);

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

      const sorted = [...data].sort(
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

  const handleDeclareForfeit = async (trialParticipantId) => {
    try {
      setError(null);
      await athleteTrialService.declareForfeit(trialParticipantId);

      setSchedule((prev) =>
        prev.map((trial) =>
          trial.trialParticipantId === trialParticipantId
            ? { ...trial, participantStatus: "FORFEIT" }
            : trial
        )
      );
    } catch (err) {
      console.error("Erreur lors de la déclaration de forfait:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Impossible de déclarer le forfait pour cette épreuve"
        );
      } else if (err.response?.status === 403) {
        setError("Vous n'êtes pas autorisé à déclarer ce forfait");
      } else if (err.response?.status === 404) {
        setError("Participation à l'épreuve introuvable");
      } else {
        setError("Erreur lors de la déclaration de forfait");
      }
    }
  };

  const loadAthleteResultsData = async () => {
    setResultsLoading(true);
    setResultsError(null);
    setCompetitorsLoadError(null);
    const [aRes, cRes] = await Promise.allSettled([
      athleteService.getAthleteResults(),
      athleteService.getAthleteCompetitorsResults(),
    ]);

    if (aRes.status === "fulfilled") {
      setAthleteResults(Array.isArray(aRes.value) ? aRes.value : []);
    } else {
      setAthleteResults([]);
      const err = aRes.reason;
      console.error("Erreur chargement résultats athlète:", err);
      if (err?.response?.status === 401) {
        setResultsError("Session expirée. Veuillez vous reconnecter.");
      } else if (err?.response?.status === 403) {
        setResultsError("Vous n'avez pas accès à vos résultats.");
      } else {
        setResultsError(
          err?.response?.data?.message || "Erreur lors du chargement de vos résultats."
        );
      }
    }

    if (cRes.status === "fulfilled") {
      setCompetitorResults(Array.isArray(cRes.value) ? cRes.value : []);
    } else {
      setCompetitorResults([]);
      if (aRes.status === "fulfilled") {
        const err = cRes.reason;
        console.warn("Erreur chargement résultats concurrents:", err);
        setCompetitorsLoadError(
          err?.response?.data?.message ||
            "Les résultats des autres concurrents ne sont pas disponibles pour le moment."
        );
      }
    }

    setResultsLoading(false);
  };

  const handleOpenResultsDialog = async (trial) => {
    setSelectedTrial(trial);
    setOpenResultsDialog(true);
    if (athleteResults === null || competitorResults === null) {
      await loadAthleteResultsData();
    }
  };

  const handleCloseResultsDialog = () => {
    setOpenResultsDialog(false);
    setSelectedTrial(null);
    setResultsError(null);
    setCompetitorsLoadError(null);
  };

  const resultsForSelectedTrial = useMemo(() => {
    if (!selectedTrial || !Array.isArray(athleteResults)) return [];
    return athleteResults.filter((r) => r.trialId === selectedTrial.trialId);
  }, [selectedTrial, athleteResults]);

  const competitorsForSelectedTrial = useMemo(() => {
    if (!selectedTrial || !Array.isArray(competitorResults)) return [];
    const rows = competitorResults.filter((r) => r.trialId === selectedTrial.trialId);
    return [...rows].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  }, [selectedTrial, competitorResults]);

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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {schedule.map((trial, index) => {
            const canDeclareForfeit =
              trial.trialParticipantId &&
              trial.trialStatus === "UPCOMING" &&
              trial.participantStatus !== "FORFEIT";

            return (
              <Card
                key={trial.trialParticipantId || trial.trialId || index}
                sx={{
                  width: 400,
                  minWidth: 400,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: appTheme.radius.lg,
                  boxShadow: appTheme.shadows.card,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: appTheme.shadows.cardHover,
                  },
                }}
              >
                <CardContent
                  sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}
                >
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
                        color: appTheme.colors.cyan,
                        flex: 1,
                      }}
                    >
                      {trial.trialName}
                    </Typography>

                    <Chip
                      label={STATUS_LABELS[trial.trialStatus] || trial.trialStatus}
                      size="small"
                      sx={{
                        backgroundColor: `${
                          STATUS_COLORS[trial.trialStatus] || "#6b7280"
                        }20`,
                        color: STATUS_COLORS[trial.trialStatus] || "#6b7280",
                        fontWeight: 700,
                        ml: 1,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={PHASE_LABELS[trial.phase] || trial.phase}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(34, 211, 238, 0.15)",
                        color: appTheme.colors.dark,
                        fontWeight: 600,
                      }}
                    />

                    {trial.participantStatus && (
                      <Chip
                        label={
                          PARTICIPANT_STATUS_LABELS[trial.participantStatus] ||
                          trial.participantStatus
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            trial.participantStatus === "FORFEIT"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(34, 197, 94, 0.15)",
                          color:
                            trial.participantStatus === "FORFEIT"
                              ? "#ef4444"
                              : "#16a34a",
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 18, color: "#000000" }} />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#000000",
                        }}
                      >
                        <strong>Début:</strong> {formatDateTime(trial.startTime)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 18, color: "#000000" }} />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#000000",
                        }}
                      >
                        <strong>Fin:</strong> {formatDateTime(trial.endTime)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      <LocationOnIcon
                        sx={{ fontSize: 18, color: "#000000", mt: 0.5 }}
                      />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#000000",
                        }}
                      >
                        <strong>Lieu:</strong> {trial.siteAddress}
                      </Typography>
                    </Box>
                    {trial.trialStatus === "COMPLETED" &&
                      trial.participantStatus !== "FORFEIT" && (
                      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenResultsDialog(trial)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            fontSize: 14,
                            px: 3,
                            py: 1,
                            borderRadius: appTheme.radius.pill,
                            background:
                              "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "#fff",
                            boxShadow: "0 6px 16px rgba(34,197,94,0.35)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #16a34a, #15803d)",
                            },
                          }}
                        >
                          Voir les résultats
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    {trial.participantStatus === "FORFEIT" ? (
                      <Alert severity="warning">
                        Vous avez déclaré forfait pour cette épreuve.
                      </Alert>
                    ) : canDeclareForfeit ? (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() =>
                          handleDeclareForfeit(trial.trialParticipantId)
                        }
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: appTheme.radius.pill,
                        }}
                      >
                        Déclarer forfait
                      </Button>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <AthleteTrialResultsDialog
        open={openResultsDialog}
        onClose={handleCloseResultsDialog}
        trial={selectedTrial}
        loading={resultsLoading}
        error={resultsError}
        competitorsError={competitorsLoadError}
        results={resultsForSelectedTrial}
        competitorResults={competitorsForSelectedTrial}
      />
    </Box>
  );
}