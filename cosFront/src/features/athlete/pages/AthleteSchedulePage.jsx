import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../common/contexts/AuthContext";
import CompetitionMapModal from "../../map/components/CompetitionMapModal";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Map as MapIcon,
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
  CANCELED: "Annulée",
};

const STATUS_COLORS = {
  UPCOMING: "#f59e0b",
  IN_PROGRESS: "#22d3ee",
  COMPLETED: "#16a34a",
  CANCELED: "#ef4444",
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

const DEFAULT_ACCESS_DENIED =
  "Votre participation est en attente de validation par le commissaire. Vous ne pouvez pas encore consulter votre planning.";

const PAGE_BG =
  "linear-gradient(165deg, #ecfeff 0%, #fef9c3 28%, #fff7ed 55%, #e0f2fe 100%)";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1600&q=75";

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
  const [mapOpen, setMapOpen] = useState(false);
  const { user } = useAuth();

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

      const sorted = [...(data || [])].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );

      setSchedule(sorted);
    } catch (err) {
      console.error("Erreur lors du chargement du planning:", err);
      if (err.response?.status === 404) {
        setError("Compétition non trouvée");
      } else if (err.response?.status === 403) {
        setError(err.response?.data?.message || DEFAULT_ACCESS_DENIED);
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
  const competitionHeading = schedule[0]?.competitionName || "";
  const normalizeTrialStatus = (status) => String(status || "").toUpperCase();
  const isCancelledTrialStatus = (status) => {
    const normalized = normalizeTrialStatus(status);
    return normalized === "CANCELED";
  };
  const getStatusLabel = (status) => {
    if (isCancelledTrialStatus(status)) return "Annulée";
    return STATUS_LABELS[normalizeTrialStatus(status)] || status;
  };
  const getStatusColor = (status) => {
    if (isCancelledTrialStatus(status)) return STATUS_COLORS.CANCELED;
    return STATUS_COLORS[normalizeTrialStatus(status)] || "#6b7280";
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        background: PAGE_BG,
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3 },
        pb: 6,
      }}
    >
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/athlete/competitions")}
          sx={{
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
        <Button
          startIcon={<MapIcon />}
          onClick={() => setMapOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            borderRadius: appTheme.radius.pill,
            background: "rgba(34, 211, 238, 0.12)",
            color: appTheme.colors.cyan,
            border: "1px solid rgba(34, 211, 238, 0.2)",
            "&:hover": { background: "rgba(34, 211, 238, 0.2)" },
          }}
        >
          Plans
        </Button>
      </Box>

      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          mb: 4,
          border: "1px solid rgba(15, 39, 68, 0.1)",
          boxShadow: "0 12px 40px rgba(15, 39, 68, 0.1)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HEADER_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center 45%",
            transform: "scale(1.05)",
            filter: "blur(4px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.72) 50%, rgba(234,88,12,0.35) 100%)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            p: { xs: 2.5, md: 3.5 },
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip
              icon={<ScheduleOutlinedIcon sx={{ fontSize: 18, color: "#fef08a !important" }} />}
              label="Planning compétition"
              size="small"
              sx={{
                fontWeight: 800,
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            />
          </Stack>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "1.75rem", md: "2.15rem" },
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              mb: 1.5,
              textShadow: "0 2px 14px rgba(0,0,0,0.35)",
            }}
          >
            Mon planning
            {competitionHeading ? (
              <>
                <Box component="span" sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
                  {" "}
                  —{" "}
                </Box>
                <Box component="span" sx={{ color: "#fde047" }}>{competitionHeading}</Box>
              </>
            ) : null}
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              maxWidth: 640,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,0.95)", lineHeight: 1.65 }}>
              Horaires, phases et lieux de vos épreuves. Vous pouvez déclarer forfait selon les règles de
              la compétition (tant que l&apos;épreuve n&apos;a pas réellement commencé côté organisation).
            </Typography>
          </Box>
        </Box>
      </Box>

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
            borderRadius: 3,
            background: "rgba(255,255,255,0.75)",
            border: "1px dashed rgba(14, 165, 233, 0.35)",
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
            Aucune épreuve trouvée pour cette compétition
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "flex-start",
          }}
        >
          {schedule.map((trial, index) => {
            const isCancelled = isCancelledTrialStatus(trial.trialStatus);
            const canDeclareForfeit =
              trial.trialParticipantId &&
              trial.participantStatus !== "FORFEIT" &&
              trial.trialStatus !== "COMPLETED" &&
              !isCancelled;

            return (
              <Card
                key={trial.trialParticipantId || trial.trialId || index}
                sx={{
                  width: 400,
                  maxWidth: "100%",
                  minWidth: { xs: "100%", sm: 360 },
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
                      label={getStatusLabel(trial.trialStatus)}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(trial.trialStatus)}20`,
                        color: getStatusColor(trial.trialStatus),
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
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "#fff",
                            boxShadow: "0 6px 16px rgba(34,197,94,0.35)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #16a34a, #15803d)",
                            },
                          }}
                        >
                          Voir mes résultats
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    {trial.participantStatus === "FORFEIT" ? (
                      <Alert severity="warning" sx={{ width: "100%" }}>
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

      <CompetitionMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        athleteId={user?.id}
        competitionId={Number(competitionId)}
        competitionName={schedule[0]?.competitionName}
      />

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