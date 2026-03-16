import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Breadcrumbs,
  Link,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import spectatorService from "../services/spectatorService";
import appTheme from "../../../common/theme/appTheme";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const eventData = await spectatorService.getEventById(eventId);
      setEvent(eventData);
      
      // Charger les compétitions séparément pour mieux gérer les erreurs
      try {
        const competitionsData = await spectatorService.getCompetitionsByEvent(eventId);
        setCompetitions(competitionsData || []);
      } catch (compErr) {
        console.error("Erreur lors du chargement des compétitions:", compErr);
        // Si erreur 403, c'est un problème de permissions
        if (compErr.response?.status === 403) {
          setError("Vous n'avez pas les permissions pour voir les compétitions. Veuillez contacter un administrateur.");
        } else {
          setCompetitions([]);
        }
      }
    } catch (err) {
      setError("Impossible de charger les données de l'événement. Veuillez réessayer.");
      console.error("Erreur lors du chargement de l'événement:", err);
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

  if (error || !event) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || "Événement introuvable"}</Alert>
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
        <Typography color="text.primary">{event.name}</Typography>
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                color: appTheme.colors.textPrimary,
              }}
            >
              {event.name}
            </Typography>
            {event.description && (
              <Typography
                sx={{
                  color: appTheme.colors.textSecondary,
                  fontSize: "1.1rem",
                  mb: 2,
                }}
              >
                {event.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={getStatusLabel(event.status)}
            sx={{
              background: `${getStatusColor(event.status)}20`,
              color: getStatusColor(event.status),
              fontWeight: 600,
              border: `1px solid ${getStatusColor(event.status)}40`,
            }}
          />
        </Box>

        {event.startDate && (
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ color: appTheme.colors.cyan }} />
              <Typography sx={{ color: appTheme.colors.textSecondary }}>
                <strong>Début:</strong>{" "}
                {format(new Date(event.startDate), "d MMMM yyyy", { locale: fr })}
              </Typography>
            </Box>
            {event.endDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon sx={{ color: appTheme.colors.violet }} />
                <Typography sx={{ color: appTheme.colors.textSecondary }}>
                  <strong>Fin:</strong>{" "}
                  {format(new Date(event.endDate), "d MMMM yyyy", { locale: fr })}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Competitions */}
      <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: appTheme.colors.dark,
              }}
            >
              Compétitions ({competitions.length})
            </Typography>

        {competitions.length === 0 ? (
          <Card
            sx={{
              background: appTheme.gradients.card,
              borderRadius: appTheme.radius.lg,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: appTheme.colors.textSecondary }}>
              Aucune compétition disponible pour cet événement.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {competitions.map((competition) => (
              <Grid item xs={12} md={6} lg={4} key={competition.id}>
                <Card
                  sx={{
                    background: appTheme.gradients.card,
                    borderRadius: appTheme.radius.lg,
                    boxShadow: appTheme.shadows.card,
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 0 2px ${appTheme.colors.violet}40`,
                    },
                    height: "100%",
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      navigate(`/spectator/competitions/${competition.id}`)
                    }
                    sx={{ height: "100%", p: 0 }}
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
                        <EmojiEventsIcon
                          sx={{ fontSize: 32, color: appTheme.colors.violet }}
                        />
                        <Chip
                          label={getStatusLabel(competition.status)}
                          size="small"
                          sx={{
                            background: `${getStatusColor(competition.status)}20`,
                            color: getStatusColor(competition.status),
                            fontWeight: 600,
                            border: `1px solid ${getStatusColor(competition.status)}40`,
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
                        {competition.name}
                      </Typography>

                      {competition.description && (
                        <Typography
                          sx={{
                            color: appTheme.colors.textSecondary,
                            fontSize: "0.875rem",
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {competition.description}
                        </Typography>
                      )}

                      {competition.startDate && (
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
                            {format(new Date(competition.startDate), "d MMM yyyy", {
                              locale: fr,
                            })}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

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
          Retour à la liste des événements
        </Button>
      </Box>
    </Box>
  );
}
