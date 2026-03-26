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
import competitionFollowService from "../services/competitionFollowService";
import appTheme from "../../../common/theme/appTheme";
import CompetitionSwimImage from "../components/CompetitionSwimImage";
import {
  competitionStatusColor,
  competitionStatusLabel,
  eventStatusChipProps,
} from "../utils/competitionStatus";
import HtmlContent from "../../../common/components/HtmlContent";
import { useNotificationUnread } from "../../../common/contexts/NotificationUnreadContext";
import SpectatorSocialShell from "../components/SpectatorSocialShell";

const pageInk = "#0f2744";
const pageMuted = "#475569";
const pageBorder = "rgba(15, 39, 68, 0.1)";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationUnread();
  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followedCompetitionIds, setFollowedCompetitionIds] = useState([]);
  const [followActionId, setFollowActionId] = useState(null);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await competitionFollowService.listFollowed();
        if (!cancelled) {
          setFollowedCompetitionIds(
            list.map((row) => String(row.competitionId))
          );
        }
      } catch {
        if (!cancelled) setFollowedCompetitionIds([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const toggleCompetitionFollow = async (competitionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = String(competitionId);
    const isFollowing = followedCompetitionIds.includes(id);
    setFollowActionId(id);
    try {
      if (isFollowing) {
        await competitionFollowService.unfollow(competitionId);
        setFollowedCompetitionIds((prev) => prev.filter((x) => x !== id));
      } else {
        await competitionFollowService.follow(competitionId);
        setFollowedCompetitionIds((prev) =>
          prev.includes(id) ? prev : [...prev, id]
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowActionId(null);
    }
  };

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

  const eventChip = event ? eventStatusChipProps(event) : null;

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
    <SpectatorSocialShell
      activeKey="home"
      unreadCount={unreadCount}
      leftTitle="Espace fan"
      hideRight
      onNavigate={(key) => {
        if (key === "home") navigate("/spectator");
        if (key === "followed") navigate("/spectator?view=followed");
        if (key === "followed_results") navigate("/spectator?view=followed_results");
        if (key === "map") navigate("/spectator/map");
        if (key === "notifications") navigate("/spectator/notifications");
        if (key === "profile") navigate("/spectator/profile");
        if (key === "tickets") navigate("/spectator/tickets");
      }}
      center={
        <Box
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: 1180,
            mx: "auto",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            px: { xs: 0, sm: 0, md: 0 },
            py: 0,
            boxSizing: "border-box",
            fontFamily: appTheme.typography.fontFamily,
          }}
        >
      <Breadcrumbs
        sx={{ mb: 2.5, "& .MuiTypography-root": { color: pageMuted, fontWeight: 600 } }}
        separator="›"
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate("/spectator")}
          sx={{
            color: "#0e7490",
            fontWeight: 700,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Accueil fan
        </Link>
        <Typography sx={{ color: pageInk, fontWeight: 800 }}>{event.name}</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          border: `1px solid ${pageBorder}`,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.45) 55%, rgba(236,253,245,0.3) 100%)",
          boxShadow: "0 8px 32px rgba(15, 39, 68, 0.07)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 900,
                mb: 1,
                color: pageInk,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {event.name}
            </Typography>
            {event.description && (
              <HtmlContent
                html={event.description}
                sx={{
                  color: pageMuted,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  mb: 0,
                  fontWeight: 500,
                  lineHeight: 1.6,
                }}
              />
            )}
          </Box>
          <Chip
            label={eventChip.label}
            sx={{
              flexShrink: 0,
              background: `${eventChip.color}20`,
              color: eventChip.color,
              fontWeight: 800,
              border: `1px solid ${eventChip.color}44`,
            }}
          />
        </Box>

        {event.startDate && (
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ color: "#0891b2" }} />
              <Typography sx={{ color: pageMuted, fontWeight: 600 }}>
                <Box component="span" sx={{ color: pageInk }}>
                  Début :
                </Box>{" "}
                {format(new Date(event.startDate), "d MMMM yyyy", { locale: fr })}
              </Typography>
            </Box>
            {event.endDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon sx={{ color: appTheme.colors.violet }} />
                <Typography sx={{ color: pageMuted, fontWeight: 600 }}>
                  <Box component="span" sx={{ color: pageInk }}>
                    Fin :
                  </Box>{" "}
                  {format(new Date(event.endDate), "d MMMM yyyy", { locale: fr })}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 900,
            mb: 2,
            color: pageInk,
            fontSize: { xs: "1.2rem", sm: "1.35rem" },
            letterSpacing: "-0.02em",
          }}
        >
          Compétitions ({competitions.length})
        </Typography>

        {competitions.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${pageBorder}`,
              bgcolor: "rgba(255,255,255,0.96)",
              p: 4,
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(15, 39, 68, 0.05)",
            }}
          >
            <Typography sx={{ color: pageMuted, fontWeight: 600 }}>
              Aucune compétition disponible pour cet événement.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {competitions.map((competition) => {
              const st = competitionStatusColor(competition.status);
              return (
              <Grid item xs={12} md={6} key={competition.id}>
                <Card
                  elevation={0}
                  sx={{
                    background: "#fff",
                    borderRadius: appTheme.radius.lg,
                    border: `1px solid ${pageBorder}`,
                    boxShadow: "0 10px 28px rgba(15, 39, 68, 0.08)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    overflow: "hidden",
                    borderLeft: `6px solid ${st}`,
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: `0 16px 36px rgba(15, 39, 68, 0.12), 0 0 0 1px ${st}33`,
                    },
                    height: "100%",
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      navigate(`/spectator/competitions/${competition.id}`)
                    }
                    sx={{
                      height: "100%",
                      p: 0,
                      alignItems: "stretch",
                      flexDirection: "column",
                    }}
                  >
                    <CompetitionSwimImage competitionId={competition.id} height={200} />
                    <CardContent sx={{ p: 3, flex: 1, width: "100%", boxSizing: "border-box" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                          gap: 1,
                        }}
                      >
                        <EmojiEventsIcon
                          sx={{ fontSize: 32, color: appTheme.colors.violet }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Button
                            size="small"
                            variant="text"
                            disabled={followActionId === String(competition.id)}
                            onClick={(e) => toggleCompetitionFollow(competition.id, e)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 800,
                              minWidth: 0,
                              px: 1,
                              color: followedCompetitionIds.includes(String(competition.id))
                                ? appTheme.colors.violet
                                : pageMuted,
                            }}
                          >
                            {followActionId === String(competition.id)
                              ? "…"
                              : followedCompetitionIds.includes(String(competition.id))
                                ? "Abonné"
                                : "Suivre"}
                          </Button>
                          <Chip
                            label={competitionStatusLabel(
                              competition.status,
                              competition.statusLabel
                            )}
                            size="small"
                            sx={{
                              background: `${st}18`,
                              color: st,
                              fontWeight: 700,
                              border: `1px solid ${st}44`,
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          mb: 1,
                          color: pageInk,
                        }}
                      >
                        {competition.name}
                      </Typography>

                      {competition.description && (
                        <HtmlContent
                          html={competition.description}
                          sx={{
                            color: pageMuted,
                            fontSize: "0.875rem",
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        />
                      )}

                      {competition.startDate && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 2,
                            pt: 2,
                            borderTop: `1px solid ${pageBorder}`,
                          }}
                        >
                          <CalendarTodayIcon sx={{ fontSize: 16, color: pageMuted }} />
                          <Typography
                            sx={{
                              color: pageMuted,
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                            }}
                          >
                            {format(new Date(competition.startDate), "d MMM yyyy", {
                              locale: fr,
                            })}
                          </Typography>
                        </Box>
                      )}
                      <Typography
                        sx={{
                          mt: 1.5,
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#0e7490",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Résultats, épreuves & classement →
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/spectator")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            color: "#0e7490",
            "&:hover": { bgcolor: "rgba(8,145,178,0.08)" },
          }}
        >
          Retour à l’accueil fan
        </Button>
      </Box>
        </Box>
      }
    />
  );
}
