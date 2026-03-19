import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleIcon from "@mui/icons-material/People";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import spectatorService from "../../spectator/services/spectatorService";
import spectatorProfileService from "../../spectator/services/spectatorProfileService";
import appTheme from "../../../common/theme/appTheme";

export default function Spectator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [favorites, setFavorites] = useState([]);
  const [competitionFavorites, setCompetitionFavorites] = useState([]);
  const [competitionsCount, setCompetitionsCount] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [competitionsByEvent, setCompetitionsByEvent] = useState({});
  const [allCompetitions, setAllCompetitions] = useState([]);
  const [viewMode, setViewMode] = useState("all"); // "all" | "favorites"

  const eventsCarouselRef = useRef(null);
  const competitionsCarouselRef = useRef(null);

  useEffect(() => {
    loadEvents();
    loadFavorites();
    loadCompetitionFavorites();
  }, []);

  useEffect(() => {
    setViewMode(modeParam === "favorites" ? "favorites" : "all");
    // Quand on change de vue via le menu, on revient à la sélection "toutes les compétitions"
    setSelectedEventId(null);
  }, [modeParam]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter]);

  const loadFavorites = () => {
    const favs = spectatorProfileService.getFavorites();
    setFavorites(favs);
  };

  const loadCompetitionFavorites = () => {
    const favs = spectatorProfileService.getCompetitionFavorites();
    setCompetitionFavorites(favs);
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Recherche par nom
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (event) => event.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    setFilteredEvents(filtered);
  };

  const toggleFavorite = (eventId, e) => {
    e.stopPropagation();
    if (spectatorProfileService.isFavorite(eventId)) {
      spectatorProfileService.removeFavorite(eventId);
    } else {
      spectatorProfileService.addFavorite(eventId);
    }
    loadFavorites();
  };

  const toggleCompetitionFavorite = (competitionId, e) => {
    e.stopPropagation();
    if (spectatorProfileService.isCompetitionFavorite(competitionId)) {
      spectatorProfileService.removeCompetitionFavorite(competitionId);
    } else {
      spectatorProfileService.addCompetitionFavorite(competitionId);
    }
    loadCompetitionFavorites();
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await spectatorService.getAllEvents();
      setEvents(data);
      
      // Charger les compétitions pour chaque événement (pour les carrousels)
      const competitionsResults = await Promise.all(
        data.map(async (event) => {
          try {
            const competitions = await spectatorService.getCompetitionsByEvent(event.id);
            return { eventId: event.id, comps: competitions || [] };
          } catch (err) {
            console.warn(`Impossible de charger les compétitions pour l'événement ${event.id}:`, err);
            return { eventId: event.id, comps: [] };
          }
        })
      );

      const map = {};
      const aggregated = [];
      let totalCompetitions = 0;

      competitionsResults.forEach(({ eventId, comps }) => {
        map[eventId] = comps;
        totalCompetitions += comps?.length || 0;
        aggregated.push(
          ...(comps || []).map((c) => ({
            ...c,
            parentEventId: c.parentEventId ?? eventId,
          }))
        );
      });

      setCompetitionsByEvent(map);
      setAllCompetitions(aggregated);
      setCompetitionsCount(totalCompetitions);
    } catch (err) {
      setError("Impossible de charger les événements. Veuillez réessayer.");
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

  const favoriteEventIdSet = new Set(favorites.map((id) => String(id)));
  const competitionFavoriteIdSet = new Set(competitionFavorites.map((id) => String(id)));
  const competitionsToDisplay =
    selectedEventId !== null
      ? competitionsByEvent[selectedEventId] || []
      : viewMode === "favorites"
        ? allCompetitions.filter((c) =>
            competitionFavoriteIdSet.has(String(c.id))
          )
        : allCompetitions;

  const scrollCarousel = (ref, direction = "left") => {
    if (!ref?.current) return;
    const amount = 420;
    ref.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: 4,
        boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: `linear-gradient(135deg, ${appTheme.colors.dark} 0%, ${appTheme.colors.cyan} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
        Espace Spectateur
      </Typography>
        <Typography
          sx={{
            color: appTheme.colors.darkSoft,
            fontSize: "1.1rem",
          }}
        >
          Consultez les événements, compétitions et résultats en temps réel
        </Typography>
      </Box>

      {/* Spectateur Nav: événements (carousel pastilles) -> compétitions (carousel) */}
      <Box sx={{ mb: 4, width: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            flexWrap: "nowrap",
          }}
        >
          <IconButton
            onClick={() => scrollCarousel(eventsCarouselRef, "left")}
            sx={{
              bgcolor: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.25)",
              "&:hover": { bgcolor: "rgba(34,211,238,0.15)" },
              flex: "0 0 auto",
              width: 40,
              height: 40,
              borderRadius: "999px",
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box
            ref={eventsCarouselRef}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflowX: "auto",
              overflowY: "hidden",
              flex: "1 1 auto",
              minWidth: 0,
              flexWrap: "nowrap",
              whiteSpace: "nowrap",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              px: 0.5,
              pr: 1,
            }}
          >
            <Button
              onClick={() => setSelectedEventId(null)}
              variant="contained"
              disableElevation
              sx={{
                borderRadius: "999px",
                px: 2,
                height: 36,
                minHeight: 36,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: selectedEventId === null ? appTheme.gradients.navbar : "transparent",
                color: selectedEventId === null ? "#020617" : appTheme.colors.dark,
                backgroundColor:
                  selectedEventId === null ? "transparent" : "rgba(255,255,255,0.92)",
                border:
                  selectedEventId === null
                    ? "1px solid rgba(34,211,238,0.55)"
                    : "1px solid rgba(148,163,184,0.35)",
                boxShadow: "none",
                whiteSpace: "nowrap",
                '& .MuiButton-startIcon': { marginRight: 0 },
                "&:hover": {
                  bgcolor:
                    selectedEventId === null
                      ? appTheme.gradients.navbar
                      : "rgba(148,163,184,0.12)",
                },
              }}
            >
              <StarBorderIcon sx={{ mr: 1, fontSize: 18 }} />
              mes actus
            </Button>

            {events.map((event) => {
              const isSelected = selectedEventId === event.id;
              const isFav = spectatorProfileService.isFavorite(event.id);
              return (
                <Button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  variant="contained"
                  disableElevation
                  sx={{
                    borderRadius: "999px",
                    px: 2,
                    height: 36,
                    minHeight: 36,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: isSelected ? appTheme.gradients.navbar : "rgba(255,255,255,0.92)",
                    color: isSelected ? "#020617" : appTheme.colors.dark,
                    border: isSelected
                      ? "1px solid rgba(34,211,238,0.55)"
                      : "1px solid rgba(148,163,184,0.35)",
                    boxShadow: "none",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: isSelected
                        ? appTheme.gradients.navbar
                        : "rgba(148,163,184,0.18)",
                    },
                  }}
                >
                  {event.name}
                  {isFav && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        ml: 1,
                        borderRadius: "999px",
                        background: appTheme.colors.violet,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                </Button>
              );
            })}
          </Box>

          <IconButton
            onClick={() => scrollCarousel(eventsCarouselRef, "right")}
            sx={{
              bgcolor: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.25)",
              "&:hover": { bgcolor: "rgba(34,211,238,0.15)" },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: appTheme.colors.dark }}>
            {selectedEventId !== null
              ? `Compétitions de l'événement`
              : viewMode === "favorites"
                ? "Compétitions suivies"
                : "Toutes les compétitions"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => scrollCarousel(competitionsCarouselRef, "left")}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box
            ref={competitionsCarouselRef}
            sx={{
              display: "flex",
              gap: 3,
              overflowX: "auto",
              pb: 1,
              flex: 1,
            }}
          >
            {competitionsToDisplay.length === 0 ? (
              <Card
                sx={{
                  minWidth: 360,
                  background: appTheme.gradients.card,
                  borderRadius: appTheme.radius.lg,
                  p: 3,
                }}
              >
                <Typography sx={{ color: appTheme.colors.textSecondary }}>
                  Aucune compétition disponible.
                </Typography>
              </Card>
            ) : (
              competitionsToDisplay.map((competition) => (
                <Card
                  key={competition.id}
                  sx={{
                    minWidth: 360,
                    background: appTheme.gradients.card,
                    borderRadius: appTheme.radius.lg,
                    boxShadow: appTheme.shadows.card,
                    height: "100%",
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      navigate(`/spectator/competitions/${competition.id}`)
                    }
                    sx={{ p: 0 }}
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
                          sx={{ fontSize: 28, color: appTheme.colors.violet }}
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
                            onClick={(e) =>
                              toggleCompetitionFavorite(competition.id, e)
                            }
                            sx={{
                              borderRadius: "999px",
                              textTransform: "none",
                              fontWeight: 800,
                              px: 2,
                              py: 0.75,
                              background: competitionFavoriteIdSet.has(String(competition.id))
                                ? `${appTheme.colors.violet}20`
                                : "transparent",
                              color: competitionFavoriteIdSet.has(String(competition.id))
                                ? appTheme.colors.violet
                                : appTheme.colors.textMuted,
                              border: competitionFavoriteIdSet.has(String(competition.id))
                                ? `1px solid ${appTheme.colors.violet}40`
                                : "1px solid rgba(148, 163, 184, 0.25)",
                              "&:hover": {
                                background: competitionFavoriteIdSet.has(String(competition.id))
                                  ? `${appTheme.colors.violet}25`
                                  : "rgba(34,211,238,0.08)",
                              },
                            }}
                          >
                            {competitionFavoriteIdSet.has(String(competition.id))
                              ? "Suivi"
                              : "Suivre"}
                          </Button>
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
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: appTheme.colors.textPrimary,
                          mb: 1,
                        }}
                      >
                        {competition.name}
                      </Typography>
                      {competition.startDate && (
                        <Typography sx={{ color: appTheme.colors.textMuted, fontSize: 13 }}>
                          {format(new Date(competition.startDate), "d MMM yyyy", { locale: fr })}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))
            )}
          </Box>

          <IconButton
            onClick={() => scrollCarousel(competitionsCarouselRef, "right")}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: appTheme.gradients.card,
              borderRadius: appTheme.radius.lg,
              boxShadow: appTheme.shadows.card,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <EventIcon sx={{ fontSize: 40, color: appTheme.colors.cyan }} />
                <Box>
                  <Typography
                    sx={{
                      color: appTheme.colors.textMuted,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Événements
                  </Typography>
                  <Typography
                    sx={{
                      color: appTheme.colors.textPrimary,
                      fontSize: "2rem",
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  >
                    {events.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: appTheme.gradients.card,
              borderRadius: appTheme.radius.lg,
              boxShadow: appTheme.shadows.card,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <EmojiEventsIcon sx={{ fontSize: 40, color: appTheme.colors.violet }} />
                <Box>
                  <Typography
                    sx={{
                      color: appTheme.colors.textMuted,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Compétitions
                  </Typography>
                  <Typography
                    sx={{
                      color: appTheme.colors.textPrimary,
                      fontSize: "2rem",
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  >
                    {competitionsCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: appTheme.gradients.card,
              borderRadius: appTheme.radius.lg,
              boxShadow: appTheme.shadows.card,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CalendarTodayIcon sx={{ fontSize: 40, color: appTheme.colors.green }} />
                <Box>
                  <Typography
                    sx={{
                      color: appTheme.colors.textMuted,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    En cours
                  </Typography>
                  <Typography
                    sx={{
                      color: appTheme.colors.textPrimary,
                      fontSize: "2rem",
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  >
                    {events.filter((e) => e.status?.toUpperCase() === "ONGOING").length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: appTheme.gradients.card,
              borderRadius: appTheme.radius.lg,
              boxShadow: appTheme.shadows.card,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: appTheme.colors.cyan }} />
                <Box>
                  <Typography
                    sx={{
                      color: appTheme.colors.textMuted,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Résultats
                  </Typography>
                  <Typography
                    sx={{
                      color: appTheme.colors.textPrimary,
                      fontSize: "1rem",
                      fontWeight: 600,
                      mt: 0.5,
                    }}
                  >
                    Disponibles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events List supprimée : la sélection se fait via le carrousel */}
    </Box>
  );
}
