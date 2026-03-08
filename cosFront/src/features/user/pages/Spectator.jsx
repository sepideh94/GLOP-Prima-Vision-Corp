import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleIcon from "@mui/icons-material/People";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import spectatorService from "../../spectator/services/spectatorService";
import spectatorProfileService from "../../spectator/services/spectatorProfileService";
import appTheme from "../../../common/theme/appTheme";

export default function Spectator() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [favorites, setFavorites] = useState([]);
  const [competitionsCount, setCompetitionsCount] = useState(0);

  useEffect(() => {
    loadEvents();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter]);

  const loadFavorites = () => {
    const favs = spectatorProfileService.getFavorites();
    setFavorites(favs);
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

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await spectatorService.getAllEvents();
      setEvents(data);
      
      // Charger les compétitions pour chaque événement et compter
      let totalCompetitions = 0;
      for (const event of data) {
        try {
          const competitions = await spectatorService.getCompetitionsByEvent(event.id);
          totalCompetitions += competitions?.length || 0;
        } catch (err) {
          console.warn(`Impossible de charger les compétitions pour l'événement ${event.id}:`, err);
        }
      }
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
    <Box sx={{ p: { xs: 3, md: 4 } }}>
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

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: appTheme.colors.textMuted }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: appTheme.gradients.card,
                  color: appTheme.colors.textPrimary,
                  "& fieldset": {
                    borderColor: "rgba(148, 163, 184, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: appTheme.colors.cyan,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: appTheme.colors.cyan,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant={statusFilter === "ALL" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("ALL")}
                sx={{
                  background:
                    statusFilter === "ALL" ? appTheme.colors.cyan : "transparent",
                  borderColor: appTheme.colors.cyan,
                  color: statusFilter === "ALL" ? "#020617" : appTheme.colors.cyan,
                  "&:hover": {
                    background:
                      statusFilter === "ALL"
                        ? appTheme.colors.cyan
                        : `${appTheme.colors.cyan}20`,
                  },
                }}
              >
                Tous
              </Button>
              <Button
                variant={statusFilter === "UPCOMING" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("UPCOMING")}
                sx={{
                  background:
                    statusFilter === "UPCOMING" ? appTheme.colors.cyan : "transparent",
                  borderColor: appTheme.colors.cyan,
                  color: statusFilter === "UPCOMING" ? "#020617" : appTheme.colors.cyan,
                  "&:hover": {
                    background:
                      statusFilter === "UPCOMING"
                        ? appTheme.colors.cyan
                        : `${appTheme.colors.cyan}20`,
                  },
                }}
              >
                À venir
              </Button>
              <Button
                variant={statusFilter === "ONGOING" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("ONGOING")}
                sx={{
                  background:
                    statusFilter === "ONGOING" ? appTheme.colors.green : "transparent",
                  borderColor: appTheme.colors.green,
                  color: statusFilter === "ONGOING" ? "#020617" : appTheme.colors.green,
                  "&:hover": {
                    background:
                      statusFilter === "ONGOING"
                        ? appTheme.colors.green
                        : `${appTheme.colors.green}20`,
                  },
                }}
              >
                En cours
              </Button>
              <Button
                variant={statusFilter === "COMPLETED" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("COMPLETED")}
                sx={{
                  background:
                    statusFilter === "COMPLETED"
                      ? appTheme.colors.violet
                      : "transparent",
                  borderColor: appTheme.colors.violet,
                  color:
                    statusFilter === "COMPLETED" ? "#020617" : appTheme.colors.violet,
                  "&:hover": {
                    background:
                      statusFilter === "COMPLETED"
                        ? appTheme.colors.violet
                        : `${appTheme.colors.violet}20`,
                  },
                }}
              >
                Terminés
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Events List */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: appTheme.colors.dark,
          }}
        >
          {searchQuery || statusFilter !== "ALL"
            ? `Événements (${filteredEvents.length})`
            : `Tous les événements (${events.length})`}
        </Typography>
        </Box>

        {(searchQuery || statusFilter !== "ALL" ? filteredEvents : events).length === 0 ? (
          <Card
            sx={{
              background: appTheme.gradients.card,
              borderRadius: appTheme.radius.lg,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: appTheme.colors.darkSoft }}>
              {searchQuery || statusFilter !== "ALL"
                ? "Aucun événement ne correspond à vos critères."
                : "Aucun événement disponible pour le moment."}
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {(searchQuery || statusFilter !== "ALL" ? filteredEvents : events).map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card
                  sx={{
                    background: appTheme.gradients.card,
                    borderRadius: appTheme.radius.lg,
                    boxShadow: appTheme.shadows.card,
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 0 2px ${appTheme.colors.cyan}40`,
                    },
                    height: "100%",
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/spectator/events/${event.id}`)}
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
                        <EventIcon
                          sx={{ fontSize: 32, color: appTheme.colors.cyan, mb: 1 }}
                        />
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <IconButton
                            size="small"
                            onClick={(e) => toggleFavorite(event.id, e)}
                            sx={{
                              color: spectatorProfileService.isFavorite(event.id)
                                ? appTheme.colors.violet
                                : appTheme.colors.textMuted,
                              "&:hover": {
                                color: appTheme.colors.violet,
                              },
                            }}
                          >
                            {spectatorProfileService.isFavorite(event.id) ? (
                              <FavoriteIcon />
                            ) : (
                              <FavoriteBorderIcon />
                            )}
                          </IconButton>
                          <Chip
                            label={getStatusLabel(event.status)}
                            size="small"
                            sx={{
                              background: `${getStatusColor(event.status)}20`,
                              color: getStatusColor(event.status),
                              fontWeight: 600,
                              border: `1px solid ${getStatusColor(event.status)}40`,
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: appTheme.colors.textPrimary,
                        }}
                      >
                        {event.name}
                      </Typography>

                      {event.description && (
                        <Typography
                          sx={{
                            color: appTheme.colors.textMuted,
                            fontSize: "0.875rem",
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {event.description}
                        </Typography>
                      )}

                      {event.startDate && (
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
                            {format(new Date(event.startDate), "d MMMM yyyy", {
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
    </Box>
  );
}
