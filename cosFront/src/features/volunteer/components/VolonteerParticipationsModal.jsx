import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import scheduleService from "../../schedule/services/scheduleService";

const STATUS_LABELS = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
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

export default function VolunteerParticipationsModal({
  open,
  onClose,
  volunteer,
}) {
  const [scheduleSummary, setScheduleSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const volunteerName = volunteer
    ? `${volunteer.firstName || ""} ${volunteer.lastName || ""}`.trim()
    : "";

  useEffect(() => {
    if (open && volunteer?.id) {
      loadScheduleSummary();
    } else {
      setScheduleSummary([]);
      setError(null);
    }
  }, [open, volunteer?.id]);

  const loadScheduleSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getVolunteerScheduleSummary(volunteer.id);
      setScheduleSummary(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement de l'agenda:", err);
      if (err.response?.status === 404) {
        setError("Volontaire non trouvé");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas accès à ces informations");
      } else {
        setError(
          err.response?.data?.message || "Erreur lors du chargement de l'agenda"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {volunteerName
          ? `Agenda détaillé de ${volunteerName}`
          : "Agenda détaillé du volontaire"}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : scheduleSummary.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center" }}>
            Aucune mission assignée pour ce volontaire.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {scheduleSummary.map((mission, index) => (
              <Box key={index}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <AssignmentIcon
                    sx={{ fontSize: 24, color: appTheme.colors.primary }}
                  />
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: appTheme.colors.dark,
                      flex: 1,
                    }}
                  >
                    {mission.title}
                  </Typography>
                  <Chip
                    label={
                      STATUS_LABELS[mission.assignmentStatus] ||
                      mission.assignmentStatus
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        mission.assignmentStatus === "CONFIRMED"
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                      color:
                        mission.assignmentStatus === "CONFIRMED"
                          ? "#16a34a"
                          : "#ef4444",
                      fontWeight: 700,
                    }}
                  />
                </Box>

                <Box sx={{ pl: 4, display: "flex", flexDirection: "column", gap: 1 }}>
                  {mission.competitionName && (
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: appTheme.colors.textMuted,
                        fontStyle: "italic",
                      }}
                    >
                      <strong>Compétition:</strong> {mission.competitionName}
                    </Typography>
                  )}

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
                      <strong>Début:</strong> {formatDateTime(mission.missionStart)}
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
                      <strong>Fin:</strong> {formatDateTime(mission.missionEnd)}
                    </Typography>
                  </Box>

                  {mission.siteAddress && (
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
                        <strong>Lieu:</strong> {mission.siteAddress}
                      </Typography>
                    </Box>
                  )}

                  {mission.occurringTrialNames &&
                    mission.occurringTrialNames.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: appTheme.colors.dark,
                            mb: 1,
                          }}
                        >
                          Épreuves pendant cette mission:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {mission.occurringTrialNames.map((trialName, idx) => (
                            <Chip
                              key={idx}
                              label={trialName}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(34, 211, 238, 0.15)",
                                color: appTheme.colors.dark,
                                fontWeight: 600,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                </Box>

                {index < scheduleSummary.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #86efac, #4ade80)",
            color: "#064e3b",
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}