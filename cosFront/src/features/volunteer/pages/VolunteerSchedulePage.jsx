import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Assignment as AssignmentIcon,
  EventAvailableOutlined as EventAvailableOutlinedIcon,
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
  UPCOMING: "#d97706",
  IN_PROGRESS: "#0284c7",
  COMPLETED: "#15803d",
  CANCELED: "#dc2626",
};

const cardText = {
  title: "#0f172a",
  body: "#334155",
  label: "#0c4a6e",
  strong: "#0f172a",
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
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "100%",
        background:
          "linear-gradient(180deg, #ecfeff 0%, #E8F3FC 40%, #F0F7FF 100%)",
        pb: 4,
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 2.5, md: 3 },
        pt: { xs: 2, sm: 3 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          border: "1px solid rgba(15, 39, 68, 0.1)",
          borderLeft: "6px solid #0284c7",
          background: "linear-gradient(145deg, #ffffff 0%, #f0f9ff 55%, #ffffff 100%)",
          boxShadow: "0 12px 32px rgba(14, 165, 233, 0.12)",
        }}
      >
        <CardContent sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                color: "#fff",
                boxShadow: "0 6px 16px rgba(2, 132, 199, 0.35)",
              }}
            >
              <EventAvailableOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 24, sm: 28 },
                  fontWeight: 900,
                  color: "#0c1a2e",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Mon planning
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  color: "#334155",
                  fontWeight: 600,
                  mt: 0.5,
                  maxWidth: 560,
                  lineHeight: 1.6,
                }}
              >
                Retrouvez ici toutes vos missions assignées : horaires, lieux et détails.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress sx={{ color: "#0284c7" }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : schedule.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            border: "2px dashed rgba(2, 132, 199, 0.35)",
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 8px 24px rgba(15, 39, 68, 0.06)",
          }}
        >
          <EventAvailableOutlinedIcon
            sx={{ fontSize: 48, color: "rgba(2, 132, 199, 0.45)", mb: 2 }}
          />
          <Typography sx={{ fontWeight: 800, color: "#0c1a2e", mb: 1 }}>
            Aucune mission pour l’instant
          </Typography>
          <Typography sx={{ color: "#334155", fontSize: 14, fontWeight: 500, maxWidth: 400, mx: "auto" }}>
            Lorsque l’organisation vous affectera des créneaux, ils apparaîtront ici automatiquement.
          </Typography>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            width: "100%",
            boxSizing: "border-box",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            columnGap: 3,
            rowGap: 3,
            alignItems: "stretch",
            justifyContent: "stretch",
          }}
        >
          {schedule.map((mission) => (
            <Box
              key={mission.id}
              sx={{
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                display: "flex",
                flexDirection: "column",
                minHeight: 280,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  height: "auto",
                  minHeight: 280,
                  minWidth: 0,
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  borderRadius: appTheme.radius.lg,
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderLeft: "5px solid #0ea5e9",
                  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 16px 36px rgba(14, 165, 233, 0.15)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flex: "1 1 auto",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    "&:last-child": { pb: 3 },
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                      <AssignmentIcon
                        sx={{ fontSize: 26, color: "#0369a1" }}
                      />
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: cardText.title,
                          lineHeight: 1.3,
                        }}
                      >
                        {mission.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={STATUS_LABELS[mission.status] || mission.status}
                      size="small"
                      sx={{
                        backgroundColor: `${STATUS_COLORS[mission.status] || "#475569"}33`,
                        color: STATUS_COLORS[mission.status] || "#334155",
                        fontWeight: 800,
                        border: `1px solid ${STATUS_COLORS[mission.status] || "#64748b"}55`,
                        ml: 1,
                      }}
                    />
                  </Box>

                  {mission.description && (
                    <HtmlContent
                      html={mission.description}
                      sx={{
                        fontSize: 14,
                        color: cardText.body,
                        fontWeight: 500,
                        mb: 2,
                        "& strong": { color: cardText.strong },
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 20, color: "#0369a1" }}
                      />
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: cardText.body,
                        }}
                      >
                        <Box component="span" sx={{ color: cardText.label, fontWeight: 800 }}>
                          Début :
                        </Box>{" "}
                        {formatDateTime(mission.startTime)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 20, color: "#0369a1" }}
                      />
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: cardText.body,
                        }}
                      >
                        <Box component="span" sx={{ color: cardText.label, fontWeight: 800 }}>
                          Fin :
                        </Box>{" "}
                        {formatDateTime(mission.endTime)}
                      </Typography>
                    </Box>

                    {mission.site && (
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <LocationOnIcon
                          sx={{ fontSize: 20, color: "#0369a1", mt: 0.35 }}
                        />
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: cardText.body,
                          }}
                        >
                          <Box component="span" sx={{ color: cardText.label, fontWeight: 800 }}>
                            Lieu :
                          </Box>{" "}
                          {mission.site.adress}
                        </Typography>
                      </Box>
                    )}

                    {mission.competitionName && (
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1e3a8a",
                          fontStyle: "italic",
                          pt: 0.5,
                        }}
                      >
                        <Box component="span" sx={{ fontStyle: "normal", fontWeight: 800, color: cardText.label }}>
                          Compétition :
                        </Box>{" "}
                        {mission.competitionName}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
