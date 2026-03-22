import { useState, useEffect, useRef, useMemo } from "react";
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
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import PoolIcon from "@mui/icons-material/Pool";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import spectatorService from "../../spectator/services/spectatorService";
import spectatorProfileService from "../../spectator/services/spectatorProfileService";
import appTheme from "../../../common/theme/appTheme";
import CompetitionSwimImage from "../../spectator/components/CompetitionSwimImage";
import {
  competitionStatusColor,
  competitionStatusLabel,
} from "../../spectator/utils/competitionStatus";

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
  const [competitionSearch, setCompetitionSearch] = useState("");

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
        const parentEventName = data.find((e) => e.id === eventId)?.name || "Événement";
        aggregated.push(
          ...(comps || []).map((c) => ({
            ...c,
            parentEventId: c.parentEventId ?? eventId,
            parentEventName,
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

  const competitionSearchNorm = competitionSearch.trim().toLowerCase();
  const competitionsFiltered = useMemo(() => {
    if (!competitionSearchNorm) return competitionsToDisplay;
    return competitionsToDisplay.filter(
      (c) =>
        c.name?.toLowerCase().includes(competitionSearchNorm) ||
        c.description?.toLowerCase().includes(competitionSearchNorm) ||
        c.parentEventName?.toLowerCase().includes(competitionSearchNorm)
    );
  }, [competitionsToDisplay, competitionSearchNorm]);

  const completedCompetitionsCount = useMemo(
    () =>
      allCompetitions.filter(
        (c) => String(c.status ?? "").toUpperCase().replace(/[\s-]+/g, "_") === "COMPLETED"
      ).length,
    [allCompetitions]
  );

  const ongoingCompetitionsCount = useMemo(
    () =>
      allCompetitions.filter((c) => {
        const s = String(c.status ?? "").toUpperCase().replace(/[\s-]+/g, "_");
        return s === "IN_PROGRESS" || s === "ONGOING";
      }).length,
    [allCompetitions]
  );

  const globalFilterLabel =
    viewMode === "favorites" ? "Mes compétitions suivies" : "Toutes les compétitions";

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
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          px: { xs: 2, sm: 3 },
          py: 4,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: { xs: "50vh", md: "55vh" },
            borderRadius: { xs: 2, sm: 3 },
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          }}
        >
          <CircularProgress sx={{ color: appTheme.colors.cyan }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flex: 1, width: "100%", px: { xs: 2, sm: 3 }, py: 4, boxSizing: "border-box" }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: "100%",
          p: { xs: 2, sm: 2.5, md: 3.5 },
          background: "rgba(15, 23, 42, 0.42)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: { xs: 2, md: 3 },
          boxShadow: "0 8px 32px rgba(2, 6, 23, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxSizing: "border-box",
        }}
      >
      {/* En-tête type site */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            letterSpacing: "0.2em",
            fontWeight: 700,
            color: appTheme.colors.green,
            display: "block",
            mb: 1,
          }}
        >
          Natation & compétitions
        </Typography>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 1,
            color: "#f8fafc",
            textShadow: "0 2px 24px rgba(2, 6, 23, 0.45)",
          }}
        >
          Espace spectateur
        </Typography>
        <Typography
          sx={{
            color: "rgba(226, 232, 240, 0.92)",
            fontSize: "1.05rem",
            maxWidth: "42rem",
            lineHeight: 1.6,
            textShadow: "0 1px 12px rgba(2, 6, 23, 0.35)",
          }}
        >
          Suivez les événements et les compétitions comme sur un site dédié : résultats,
          statuts et accès rapide à chaque épreuve.
        </Typography>
      </Box>

      {/* Événements : filtre explicite */}
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: "rgba(226,232,240,0.88)", fontWeight: 700, mb: 0.5 }}
        >
          Filtrer par événement
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(226,232,240,0.65)", display: "block" }}>
          Choisissez un événement pour n’afficher que ses compétitions, ou la vue globale pour tout voir
          {viewMode === "favorites" ? " parmi vos suivis." : "."}
        </Typography>
      </Box>

      <Box sx={{ mb: 4, width: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: "999px",
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: "0 12px 40px rgba(2, 6, 23, 0.3)",
            flexWrap: "nowrap",
          }}
        >
          <IconButton
            onClick={() => scrollCarousel(eventsCarouselRef, "left")}
            sx={{
              color: "rgba(226,232,240,0.9)",
              bgcolor: "rgba(34,211,238,0.12)",
              border: "1px solid rgba(34,211,238,0.3)",
              "&:hover": { bgcolor: "rgba(34,211,238,0.22)" },
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
                height: "auto",
                minHeight: 36,
                py: 0.75,
                textTransform: "none",
                fontWeight: 800,
                ...(selectedEventId === null
                  ? {
                      backgroundImage: appTheme.gradients.navbar,
                      backgroundColor: "rgba(34, 211, 238, 0.35)",
                      color: "#f8fafc",
                      textShadow: "0 1px 3px rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.45)",
                      boxShadow:
                        "0 0 0 2px rgba(2,6,23,0.9), 0 6px 22px rgba(34,211,238,0.45)",
                    }
                  : {
                      backgroundImage: "none",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "rgba(248,250,252,0.98)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow: "none",
                    }),
                whiteSpace: "nowrap",
                maxWidth: { xs: 200, sm: 300 },
                '& .MuiButton-startIcon': { marginRight: 0 },
                "&:hover": {
                  ...(selectedEventId === null
                    ? {
                        backgroundImage: appTheme.gradients.navbar,
                        backgroundColor: "rgba(34, 211, 238, 0.45)",
                        filter: "brightness(1.05)",
                        boxShadow:
                          "0 0 0 2px rgba(2,6,23,0.9), 0 8px 28px rgba(34,211,238,0.55)",
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.16)",
                      }),
                },
              }}
            >
              <ViewModuleIcon
                sx={{
                  mr: 1,
                  fontSize: 18,
                  flexShrink: 0,
                  color: "inherit",
                }}
              />
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "left",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="span"
                  sx={{ fontSize: 11, fontWeight: 900, lineHeight: 1.2, color: "inherit" }}
                >
                  Vue globale
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    color: "inherit",
                  }}
                >
                  {globalFilterLabel}
                </Box>
              </Box>
            </Button>

            {filteredEvents.map((event) => {
              const isSelected = selectedEventId === event.id;
              const isFav = spectatorProfileService.isFavorite(event.id);
              return (
                <Tooltip
                  key={event.id}
                  title={`Afficher uniquement les compétitions de « ${event.name} »`}
                  arrow
                >
                  <Button
                    onClick={() => setSelectedEventId(event.id)}
                    variant="contained"
                    disableElevation
                    sx={{
                      borderRadius: "999px",
                      px: 2,
                      height: 36,
                      minHeight: 36,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: 12,
                      maxWidth: { xs: 160, sm: 220 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      ...(isSelected
                        ? {
                            backgroundImage: appTheme.gradients.navbar,
                            backgroundColor: "rgba(34, 211, 238, 0.35)",
                            color: "#f8fafc",
                            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                            border: "1px solid rgba(255,255,255,0.4)",
                          }
                        : {
                            backgroundImage: "none",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "rgba(248,250,252,0.98)",
                            border: "1px solid rgba(255,255,255,0.18)",
                          }),
                      "&:hover": {
                        ...(isSelected
                          ? {
                              backgroundImage: appTheme.gradients.navbar,
                              backgroundColor: "rgba(34, 211, 238, 0.45)",
                              filter: "brightness(1.05)",
                            }
                          : {
                              backgroundColor: "rgba(255,255,255,0.16)",
                            }),
                      },
                    }}
                  >
                    <Box component="span" sx={{ mr: 0.75, opacity: 0.85, fontSize: 10, fontWeight: 800 }}>
                      Évén.
                    </Box>
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
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Button>
                </Tooltip>
              );
            })}
          </Box>

          <IconButton
            onClick={() => scrollCarousel(eventsCarouselRef, "right")}
            sx={{
              color: "rgba(226,232,240,0.9)",
              bgcolor: "rgba(34,211,238,0.12)",
              border: "1px solid rgba(34,211,238,0.3)",
              "&:hover": { bgcolor: "rgba(34,211,238,0.22)" },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Stack spacing={2} sx={{ mt: 4, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "flex-start" },
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#f8fafc", textShadow: "0 1px 16px rgba(2,6,23,0.4)" }}
            >
              {selectedEventId !== null
                ? `Compétitions de l'événement`
                : viewMode === "favorites"
                  ? "Compétitions suivies"
                  : "Toutes les compétitions"}
            </Typography>
            {selectedEventId === null && competitionsFiltered.length > 0 && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  color: "rgba(248,250,252,0.92)",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  textShadow: "0 1px 8px rgba(2,6,23,0.65)",
                  maxWidth: 560,
                }}
              >
                {competitionsFiltered.length} compétition
                {competitionsFiltered.length !== 1 ? "s" : ""} affichée
                {competitionsFiltered.length !== 1 ? "s" : ""}
                {" — "}
                faites défiler horizontalement le carrousel pour les parcourir.
              </Typography>
            )}
            </Box>
            <TextField
              size="small"
              placeholder="Rechercher une compétition, un événement…"
              value={competitionSearch}
              onChange={(e) => setCompetitionSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(148,163,184,0.9)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: { xs: "100%", md: 320 },
                maxWidth: { md: 400 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  background:
                    selectedEventId === null
                      ? "rgba(15,23,42,0.88)"
                      : "rgba(15,23,42,0.65)",
                  color: "#f8fafc",
                  "& fieldset": {
                    borderColor:
                      selectedEventId === null
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": { borderColor: "rgba(34,211,238,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: appTheme.colors.cyan },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(226,232,240,0.55)",
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            gap: { xs: 0.5, sm: 1 },
            flexDirection: { xs: "column", sm: "row" },
            ...(selectedEventId === null && competitionsFiltered.length > 0
              ? {
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  background: "rgba(15,23,42,0.78)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 48px rgba(2,6,23,0.55)",
                }
              : {}),
          }}
        >
          <IconButton
            onClick={() => scrollCarousel(competitionsCarouselRef, "left")}
            sx={{
              color: "rgba(226,232,240,0.95)",
              bgcolor: "rgba(255,255,255,0.06)",
              display: { xs: "none", sm: "inline-flex" },
              alignSelf: "center",
              "&:hover": { bgcolor: "rgba(34,211,238,0.15)" },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box
            ref={competitionsCarouselRef}
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 3 },
              overflowX: "auto",
              pb: 1,
              pt: { xs: 0.5, sm: 0 },
              flex: 1,
              scrollSnapType: { xs: "x mandatory", sm: "none" },
              WebkitOverflowScrolling: "touch",
            }}
          >
            {competitionsToDisplay.length === 0 ? (
              <Card
                sx={{
                  minWidth: { xs: "100%", sm: 360 },
                  background: "rgba(15, 23, 42, 0.55)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: appTheme.radius.lg,
                  border: "1px solid rgba(255,255,255,0.12)",
                  p: 3,
                }}
              >
                <Typography sx={{ color: "rgba(226,232,240,0.88)" }}>
                  Aucune compétition disponible.
                </Typography>
              </Card>
            ) : competitionsFiltered.length === 0 ? (
              <Card
                sx={{
                  minWidth: { xs: "100%", sm: 360 },
                  background: "rgba(15, 23, 42, 0.55)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: appTheme.radius.lg,
                  border: "1px solid rgba(255,255,255,0.12)",
                  p: 3,
                }}
              >
                <Typography sx={{ color: "rgba(226,232,240,0.88)" }}>
                  Aucun résultat pour « {competitionSearch.trim()} ». Essayez un autre mot-clé.
                </Typography>
              </Card>
            ) : (
              competitionsFiltered.map((competition) => {
                const st = competitionStatusColor(competition.status);
                const isFollowed = competitionFavoriteIdSet.has(String(competition.id));
                return (
                  <Card
                    key={competition.id}
                    sx={{
                      minWidth: { xs: "min(calc(100vw - 4rem), 320px)", sm: 360 },
                      maxWidth: { sm: 400 },
                      scrollSnapAlign: "start",
                      background: appTheme.gradients.card,
                      borderRadius: appTheme.radius.lg,
                      boxShadow: appTheme.shadows.card,
                      height: "100%",
                      overflow: "hidden",
                      border: "1px solid rgba(148, 163, 184, 0.15)",
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardActionArea
                        onClick={() =>
                          navigate(`/spectator/competitions/${competition.id}`)
                        }
                        sx={{ p: 0, alignItems: "stretch", flexDirection: "column" }}
                      >
                        <CompetitionSwimImage competitionId={competition.id} height={176} />
                        <CardContent sx={{ p: 3, width: "100%", boxSizing: "border-box" }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                            <Chip
                              icon={<PoolIcon sx={{ fontSize: "16px !important" }} />}
                              label="Natation"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                background: "rgba(34,211,238,0.15)",
                                color: appTheme.colors.cyan,
                                border: `1px solid ${appTheme.colors.cyan}44`,
                              }}
                            />
                            <Chip
                              label={competitionStatusLabel(
                                competition.status,
                                competition.statusLabel
                              )}
                              size="small"
                              sx={{
                                background: `${st}28`,
                                color: st,
                                fontWeight: 700,
                                border: `1px solid ${st}55`,
                              }}
                            />
                          </Stack>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: appTheme.colors.textPrimary,
                              mb: 1,
                              fontSize: "1.05rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {competition.name}
                          </Typography>
                          <Stack spacing={0.75} sx={{ mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                              <PlaceIcon sx={{ fontSize: 18, color: appTheme.colors.textMuted, mt: 0.2 }} />
                              <Typography sx={{ color: appTheme.colors.textSecondary, fontSize: 13 }}>
                                <Box component="span" sx={{ fontWeight: 700, color: appTheme.colors.textMuted }}>
                                  Lieu (événement)
                                </Box>
                                <br />
                                {competition.parentEventName || "—"}
                              </Typography>
                            </Box>
                            {competition.startDate && (
                              <Typography sx={{ color: appTheme.colors.textMuted, fontSize: 13 }}>
                                <Box component="span" sx={{ fontWeight: 700 }}>Période</Box>
                                {" · "}
                                {format(new Date(competition.startDate), "d MMM yyyy", { locale: fr })}
                                {competition.endDate
                                  ? ` → ${format(new Date(competition.endDate), "d MMM yyyy", { locale: fr })}`
                                  : ""}
                              </Typography>
                            )}
                          </Stack>
                          <Typography variant="caption" sx={{ color: appTheme.colors.textMuted, display: "block" }}>
                            Participants et épreuves : ouvrez la fiche compétition.
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <Box
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          px: 1,
                          py: 0.5,
                          borderRadius: "999px",
                          background: "rgba(15,23,42,0.75)",
                          backdropFilter: "blur(8px)",
                          border: isFollowed
                            ? `1px solid ${appTheme.colors.violet}66`
                            : "1px solid rgba(255,255,255,0.2)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isFollowed}
                              size="small"
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleCompetitionFavorite(competition.id, e);
                              }}
                              sx={{
                                mr: 0,
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: appTheme.colors.violet,
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                  backgroundColor: `${appTheme.colors.violet}aa`,
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: isFollowed ? appTheme.colors.violet : "rgba(226,232,240,0.85)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isFollowed ? "Suivi" : "Suivre"}
                            </Typography>
                          }
                          sx={{ m: 0, alignItems: "center" }}
                        />
                      </Box>
                    </Box>
                  </Card>
                );
              })
            )}
          </Box>

          <IconButton
            onClick={() => scrollCarousel(competitionsCarouselRef, "right")}
            sx={{
              color: "rgba(226,232,240,0.95)",
              bgcolor: "rgba(255,255,255,0.06)",
              display: { xs: "none", sm: "inline-flex" },
              alignSelf: "center",
              "&:hover": { bgcolor: "rgba(34,211,238,0.15)" },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats — contrastes renforcés */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            key: "ev",
            label: "Événements",
            value: events.length,
            icon: <EventIcon sx={{ fontSize: 28 }} />,
            accent: appTheme.colors.cyan,
          },
          {
            key: "co",
            label: "Compétitions",
            value: competitionsCount,
            icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />,
            accent: appTheme.colors.violet,
          },
          {
            key: "on",
            label: "Compétitions en cours",
            value: ongoingCompetitionsCount,
            icon: <CalendarTodayIcon sx={{ fontSize: 28 }} />,
            accent: appTheme.colors.green,
          },
          {
            key: "done",
            label: "Compétitions terminées",
            value: completedCompetitionsCount,
            icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
            accent: "#38bdf8",
          },
        ].map((tile) => (
          <Grid item xs={6} md={3} key={tile.key}>
            <Card
              sx={{
                background: "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.72) 100%)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderRadius: appTheme.radius.lg,
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: `0 12px 36px rgba(2,6,23,0.45), inset 0 0 0 1px ${tile.accent}22`,
                borderLeft: `6px solid ${tile.accent}`,
                height: "100%",
              }}
            >
              <CardContent sx={{ py: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: tile.accent,
                      background: `${tile.accent}22`,
                      border: `1px solid ${tile.accent}44`,
                    }}
                  >
                    {tile.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "rgba(226,232,240,0.75)",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {tile.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "2.25rem",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        background: `linear-gradient(135deg, #f8fafc 0%, ${tile.accent} 160%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {tile.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>
    </Box>
  );
}
