import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import HtmlContent from "../../../common/components/HtmlContent";
import scheduleService from "../../schedule/services/scheduleService";

const STATUS_LABELS = {
  UPCOMING: "À venir",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELED: "Annulé",
};

const STATUS_COLORS = {
  UPCOMING: "#f59e0b",
  IN_PROGRESS: "#22d3ee",
  COMPLETED: "#16a34a",
  CANCELED: "#ef4444",
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

export default function VolunteerSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getVolunteerSchedule();
      // Trier par date de début
      const sorted = data.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
      setSchedule(sorted);
    } catch (err) {
      console.error("Erreur lors du chargement du planning:", err);
      if (err.response?.status === 403) {
        setError("Vous n'avez pas accès à cette fonctionnalité");
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
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          fontSize: 36,
          fontWeight: 900,
          mb: 1,
        }}
      >
        Mon Planning
      </Typography>

      <Typography
        sx={{
          fontSize: 15,
          color: "#374151",
          mb: 4,
        }}
      >
        Retrouvez ici toutes vos missions assignées
      </Typography>

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
            Aucune mission assignée pour le moment
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {schedule.map((mission) => (
            <Grid item xs={12} md={6} key={mission.id}>
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                      <AssignmentIcon
                        sx={{ fontSize: 24, color: appTheme.colors.primary }}
                      />
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: appTheme.colors.dark,
                        }}
                      >
                        {mission.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={STATUS_LABELS[mission.status] || mission.status}
                      size="small"
                      sx={{
                        backgroundColor: `${STATUS_COLORS[mission.status] || "#6b7280"}20`,
                        color: STATUS_COLORS[mission.status] || "#6b7280",
                        fontWeight: 700,
                        ml: 1,
                      }}
                    />
                  </Box>

                  {mission.description && (
                    <HtmlContent
                      html={mission.description}
                      sx={{
                        fontSize: 14,
                        color: appTheme.colors.textMuted,
                        mb: 2,
                      }}
                    />
                  )}

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
                        <strong>Début:</strong> {formatDateTime(mission.startTime)}
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
                        <strong>Fin:</strong> {formatDateTime(mission.endTime)}
                      </Typography>
                    </Box>

                    {mission.site && (
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
                          <strong>Lieu:</strong> {mission.site.adress}
                        </Typography>
                      </Box>
                    )}

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
