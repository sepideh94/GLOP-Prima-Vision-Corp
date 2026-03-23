import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
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
import { SPECTATOR_MENU_GLASS_DECOR } from "../../spectator/swimmingVisuals";
import {
  spectatorGlassTint,
  textLegibleDark,
  textLegibleMuted,
  spectatorDarkMenuShell,
} from "../../spectator/spectatorGlassTheme";
import { useAuth } from "../../../common/contexts/AuthContext";
import { getSpectatorDisplayFirstName } from "../../../common/utils/spectatorWelcomeName";
import { stripHtmlTags } from "../../../common/utils/htmlUtils";

export default function Spectator() {
  const { user } = useAuth();
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
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [competitionsByEvent, setCompetitionsByEvent] = useState({});
  const [allCompetitions, setAllCompetitions] = useState([]);
  const [viewMode, setViewMode] = useState("all"); // "all" | "favorites"
  const [competitionSearch, setCompetitionSearch] = useState("");

  const eventsCarouselRef = useRef(null);
  const competitionsCarouselRef = useRef(null);
  const competitionCarouselRowRef = useRef(null);

  /** Pleine largeur + scroll si le contenu dépasse ; sinon panneau serré sur les cartes uniquement. */
  const [competitionCarouselUseFullWidth, setCompetitionCarouselUseFullWidth] =
    useState(true);

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
          stripHtmlTags(event.description).toLowerCase().includes(searchQuery.toLowerCase())
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

      competitionsResults.forEach(({ eventId, comps }) => {
        map[eventId] = comps;
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
    } catch (err) {
      setError("Impossible de charger les événements. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const competitionFavoriteIdSet = useMemo(
    () => new Set(competitionFavorites.map((id) => String(id))),
    [competitionFavorites]
  );

  const competitionsToDisplay = useMemo(() => {
    if (selectedEventId !== null) {
      return competitionsByEvent[selectedEventId] || [];
    }
    if (viewMode === "favorites") {
      return allCompetitions.filter((c) =>
        competitionFavoriteIdSet.has(String(c.id))
      );
    }
    return allCompetitions;
  }, [
    selectedEventId,
    viewMode,
    allCompetitions,
    competitionsByEvent,
    competitionFavoriteIdSet,
  ]);

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

  useLayoutEffect(() => {
    if (competitionsFiltered.length === 0) {
      setCompetitionCarouselUseFullWidth((prev) => (prev === false ? prev : false));
      return;
    }

    const measure = () => {
      const scrollEl = competitionsCarouselRef.current;
      const rowEl = competitionCarouselRowRef.current;
      if (!scrollEl || !rowEl) return;

      const available = rowEl.parentElement?.getBoundingClientRect().width ?? 0;
      if (available <= 0) return;

      const gapStyle = getComputedStyle(scrollEl);
      const gap =
        parseFloat(gapStyle.columnGap || gapStyle.gap || "0") || 0;

      let contentSum = 0;
      const kids = scrollEl.children;
      for (let i = 0; i < kids.length; i++) {
        contentSum += kids[i].getBoundingClientRect().width;
        if (i < kids.length - 1) contentSum += gap;
      }

      const rowStyle = getComputedStyle(rowEl);
      const rowPad =
        parseFloat(rowStyle.paddingLeft) + parseFloat(rowStyle.paddingRight);
      const isSm = window.matchMedia("(min-width: 600px)").matches;
      const arrowReserve =
        competitionsFiltered.length <= 1 ? 0 : isSm ? 96 : 0;

      const needsFullWidth =
        contentSum + rowPad + arrowReserve + 16 > available;

      setCompetitionCarouselUseFullWidth((prev) =>
        prev === needsFullWidth ? prev : needsFullWidth
      );
    };

    measure();

    const parent = competitionCarouselRowRef.current?.parentElement;
    const ro = new ResizeObserver(() => measure());
    if (parent) ro.observe(parent);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [competitionsFiltered]);

  const compactCompetitionCarouselPanel =
    competitionsFiltered.length > 0 && !competitionCarouselUseFullWidth;
  const hideCompetitionCarouselArrows =
    competitionsFiltered.length === 1 || !competitionCarouselUseFullWidth;

  const globalFilterLabel =
    viewMode === "favorites" ? "Mes compétitions suivies" : "Toutes les compétitions";

  const welcomeFirst = getSpectatorDisplayFirstName(user);
  const spectatorWelcomeTitle = welcomeFirst
    ? `Bienvenue, ${welcomeFirst}`
    : "Bienvenue";

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
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignSelf: "stretch",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: "100%",
            minHeight: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            borderRadius: 0,
            overflow: "hidden",
            border: "none",
            boxSizing: "border-box",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background: spectatorGlassTint,
              backdropFilter: "blur(22px) saturate(1.15)",
              WebkitBackdropFilter: "blur(22px) saturate(1.15)",
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${SPECTATOR_MENU_GLASS_DECOR})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.42,
              mixBlendMode: "soft-light",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              flex: 1,
              width: "100%",
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress sx={{ color: appTheme.colors.cyan }} />
          </Box>
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
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          position: "relative",
          borderRadius: 0,
          overflow: "hidden",
          border: "none",
          boxSizing: "border-box",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: spectatorGlassTint,
            backdropFilter: "blur(26px) saturate(1.12)",
            WebkitBackdropFilter: "blur(26px) saturate(1.12)",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${SPECTATOR_MENU_GLASS_DECOR})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            overflow: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            p: { xs: 2, sm: 2.5, md: 3.5 },
            boxSizing: "border-box",
          }}
        >
      {/* En-tête type site */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "1px solid rgba(14, 116, 144, 0.2)",
          px: { xs: 0, sm: 0.5 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 900,
            mb: 0,
            letterSpacing: "-0.02em",
            fontSize: { xs: "1.65rem", sm: "2rem" },
            ...textLegibleDark,
          }}
        >
          {spectatorWelcomeTitle}
        </Typography>
      </Box>

      <Box sx={{ mb: 4, width: "100%", overflow: "hidden" }}>
        <Box
          role="region"
          aria-label="Filtrer par événement — choisir la vue globale ou un événement"
          sx={{
            ...spectatorDarkMenuShell,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
            flexWrap: "nowrap",
          }}
        >
          <IconButton
            onClick={() => scrollCarousel(eventsCarouselRef, "left")}
            sx={{
              color: "#e2e8f0",
              bgcolor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.22)",
              flex: "0 0 auto",
              width: 40,
              height: 40,
              borderRadius: "999px",
              "&:hover": { bgcolor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.35)" },
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
                      color: "#ffffff",
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      boxShadow: "0 4px 18px rgba(34, 211, 238, 0.35)",
                    }
                  : {
                      backgroundImage: "none",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "#f1f5f9",
                      border: "1px solid rgba(255,255,255,0.22)",
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
                        filter: "brightness(1.03)",
                        boxShadow: "0 6px 22px rgba(34, 211, 238, 0.45)",
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.16)",
                        borderColor: "rgba(255,255,255,0.32)",
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
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: "inherit",
                    opacity: selectedEventId === null ? 0.95 : 0.9,
                    letterSpacing: "0.02em",
                  }}
                >
                  Vue globale
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: 14,
                    fontWeight: 900,
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
                      fontSize: 13,
                      maxWidth: { xs: 160, sm: 220 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      ...(isSelected
                        ? {
                            backgroundImage: appTheme.gradients.navbar,
                            backgroundColor: "rgba(34, 211, 238, 0.35)",
                            color: "#ffffff",
                            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                            border: "1px solid rgba(255,255,255,0.35)",
                            boxShadow: "0 4px 18px rgba(34, 211, 238, 0.35)",
                          }
                        : {
                            backgroundImage: "none",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "#f1f5f9",
                            border: "1px solid rgba(255,255,255,0.22)",
                            boxShadow: "none",
                          }),
                      "&:hover": {
                        ...(isSelected
                          ? {
                              backgroundImage: appTheme.gradients.navbar,
                              backgroundColor: "rgba(34, 211, 238, 0.45)",
                              filter: "brightness(1.03)",
                              boxShadow: "0 6px 22px rgba(34, 211, 238, 0.45)",
                            }
                          : {
                              backgroundColor: "rgba(255,255,255,0.16)",
                              borderColor: "rgba(255,255,255,0.32)",
                            }),
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
              color: "#e2e8f0",
              bgcolor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.22)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.35)" },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
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
            <Box
              sx={{
                ...spectatorDarkMenuShell,
                minWidth: 0,
                maxWidth: { md: 560 },
                py: { xs: 1.75, sm: 2 },
                px: { xs: 2, sm: 2.5 },
                borderRight: "3px solid rgba(148, 163, 184, 0.35)",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  color: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.4rem", sm: "1.55rem" },
                  lineHeight: 1.2,
                  textShadow: "0 1px 3px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,1)",
                }}
              >
                {selectedEventId !== null
                  ? `Compétitions de l'événement`
                  : viewMode === "favorites"
                    ? "Compétitions suivies"
                    : "Toutes les compétitions"}
              </Typography>
              {selectedEventId === null && competitionsFiltered.length > 0 && (
                <Typography
                  sx={{
                    mt: 1.15,
                    lineHeight: 1.55,
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                    fontWeight: 400,
                    color: "#d1d5db",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {competitionsFiltered.length} compétition
                  {competitionsFiltered.length !== 1 ? "s" : ""} — faites défiler horizontalement pour les
                  parcourir.
                </Typography>
              )}
            </Box>
            <TextField
              size="medium"
              placeholder="Rechercher une compétition, un événement…"
              value={competitionSearch}
              onChange={(e) => setCompetitionSearch(e.target.value)}
              inputProps={{
                "aria-label":
                  "Rechercher une compétition ou un événement par nom",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0.5 }}>
                    <SearchIcon sx={{ color: "#0f172a", fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", md: "auto" },
                flex: { md: "1 1 0" },
                minWidth: { xs: "100%", md: "min(100%, 360px)" },
                maxWidth: { xs: "100%", md: "min(720px, 100%)" },
                alignSelf: { md: "stretch" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.97)",
                  color: "#020617",
                  fontWeight: 600,
                  fontSize: "1rem",
                  minHeight: 48,
                  pr: 1.5,
                  boxShadow: "0 2px 12px rgba(15,23,42,0.1)",
                  "& fieldset": {
                    borderColor: "rgba(15,23,42,0.2)",
                    borderWidth: "1.5px",
                  },
                  "&:hover fieldset": { borderColor: "rgba(34,211,238,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: appTheme.colors.cyan, borderWidth: "2px" },
                },
                "& .MuiInputBase-input": {
                  py: 1.25,
                  px: 0.5,
                  fontSize: "1rem",
                  textOverflow: "clip",
                  "&::placeholder": {
                    color: "#334155",
                    opacity: 1,
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                  },
                },
              }}
            />
          </Box>
        </Stack>

        <Box
          ref={competitionCarouselRowRef}
          sx={{
            display: "flex",
            alignItems: "stretch",
            gap: { xs: 0.5, sm: 1 },
            flexDirection: { xs: "column", sm: "row" },
            ...(competitionsFiltered.length > 0
              ? {
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: appTheme.radius.lg,
                  background: "linear-gradient(145deg, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.48) 100%)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 12px 40px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
                }
              : {}),
            ...(competitionsFiltered.length > 0 && compactCompetitionCarouselPanel
              ? {
                  alignSelf: "flex-start",
                  width: "fit-content",
                  maxWidth: "100%",
                }
              : {}),
          }}
        >
          <IconButton
            onClick={() => scrollCarousel(competitionsCarouselRef, "left")}
            sx={{
              color: "#e2e8f0",
              bgcolor: "rgba(15,23,42,0.55)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              display: {
                xs: "none",
                sm: hideCompetitionCarouselArrows ? "none" : "inline-flex",
              },
              alignSelf: "center",
              "&:hover": {
                bgcolor: "rgba(34,211,238,0.2)",
                borderColor: appTheme.colors.cyan,
                color: "#f8fafc",
              },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box
            ref={competitionsCarouselRef}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              gap: { xs: 2, sm: 3 },
              overflowX: "auto",
              pb: 1,
              pt: { xs: 0.5, sm: 0 },
              flex: compactCompetitionCarouselPanel ? "0 1 auto" : 1,
              minWidth: compactCompetitionCarouselPanel ? 0 : undefined,
              scrollSnapType: { xs: "x mandatory", sm: "none" },
              WebkitOverflowScrolling: "touch",
            }}
          >
            {competitionsToDisplay.length === 0 ? (
              <Card
                sx={{
                  minWidth: { xs: "100%", sm: 360 },
                  background: "rgba(255, 255, 255, 0.76)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: appTheme.radius.lg,
                  border: "1px solid rgba(15,23,42,0.1)",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
                  p: 3,
                }}
              >
                <Typography sx={{ color: "#1e293b", fontWeight: 600 }}>
                  Aucune compétition disponible.
                </Typography>
              </Card>
            ) : competitionsFiltered.length === 0 ? (
              <Card
                sx={{
                  minWidth: { xs: "100%", sm: 360 },
                  background: "rgba(255, 255, 255, 0.76)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: appTheme.radius.lg,
                  border: "1px solid rgba(15,23,42,0.1)",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
                  p: 3,
                }}
              >
                <Typography sx={{ color: "#1e293b", fontWeight: 600 }}>
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
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      overflow: "hidden",
                      isolation: "isolate",
                      background: "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.72) 100%)",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      borderRadius: appTheme.radius.lg,
                      border: "1px solid rgba(255,255,255,0.14)",
                      boxShadow: `0 12px 36px rgba(2,6,23,0.45), inset 0 0 0 1px ${st}22`,
                      borderLeft: `6px solid ${st}`,
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardActionArea
                        onClick={() =>
                          navigate(`/spectator/competitions/${competition.id}`)
                        }
                        sx={{ p: 0, alignItems: "stretch", flexDirection: "column" }}
                      >
                        <CompetitionSwimImage
                          competitionId={competition.id}
                          height={152}
                          sx={{
                            borderRadius: `${appTheme.radius.lg} ${appTheme.radius.lg} 0 0`,
                          }}
                        />
                        <CardContent
                          sx={{
                            p: 2.5,
                            width: "100%",
                            boxSizing: "border-box",
                            flex: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: st,
                                background: `${st}22`,
                                border: `1px solid ${st}44`,
                                flexShrink: 0,
                              }}
                            >
                              <EmojiEventsIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Stack
                                direction="row"
                                spacing={0.75}
                                flexWrap="wrap"
                                alignItems="center"
                                sx={{ mb: 0.75 }}
                              >
                                <Typography
                                  sx={{
                                    color: "rgba(226,232,240,0.75)",
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  Natation
                                </Typography>
                                <Chip
                                  label={competitionStatusLabel(
                                    competition.status,
                                    competition.statusLabel
                                  )}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: "0.7rem",
                                    background: `${st}28`,
                                    color: st,
                                    fontWeight: 800,
                                    border: `1px solid ${st}55`,
                                  }}
                                />
                              </Stack>
                              <Typography
                                sx={{
                                  fontSize: "1.15rem",
                                  fontWeight: 900,
                                  lineHeight: 1.25,
                                  mb: 1,
                                  background: `linear-gradient(135deg, #f8fafc 0%, ${st} 160%)`,
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                {competition.name}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 0.5 }}>
                                <PlaceIcon
                                  sx={{ fontSize: 16, color: "rgba(148,163,184,0.95)", mt: 0.15, flexShrink: 0 }}
                                />
                                <Typography sx={{ color: "rgba(226,232,240,0.85)", fontSize: 12, fontWeight: 600 }}>
                                  {competition.parentEventName || "—"}
                                </Typography>
                              </Box>
                              {competition.startDate && (
                                <Typography sx={{ color: "rgba(148,163,184,0.95)", fontSize: 12, fontWeight: 600 }}>
                                  {format(new Date(competition.startDate), "d MMM yyyy", { locale: fr })}
                                  {competition.endDate
                                    ? ` → ${format(new Date(competition.endDate), "d MMM yyyy", { locale: fr })}`
                                    : ""}
                                </Typography>
                              )}
                              <Typography
                                sx={{
                                  mt: 1.25,
                                  color: "rgba(148,163,184,0.88)",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  display: "block",
                                }}
                              >
                                Ouvrir la fiche · participants & épreuves
                              </Typography>
                            </Box>
                          </Box>
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
                          background: "rgba(15,23,42,0.82)",
                          backdropFilter: "blur(8px)",
                          border: isFollowed
                            ? `1px solid ${appTheme.colors.violet}66`
                            : "1px solid rgba(255,255,255,0.22)",
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
              color: "#e2e8f0",
              bgcolor: "rgba(15,23,42,0.55)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              display: {
                xs: "none",
                sm: hideCompetitionCarouselArrows ? "none" : "inline-flex",
              },
              alignSelf: "center",
              "&:hover": {
                bgcolor: "rgba(34,211,238,0.2)",
                borderColor: appTheme.colors.cyan,
                color: "#f8fafc",
              },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
        </Box>
      </Box>
    </Box>
  );
}
