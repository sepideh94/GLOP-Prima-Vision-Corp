import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Stack,
  Paper,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import spectatorService from "../../spectator/services/spectatorService";
import spectatorProfileService from "../../spectator/services/spectatorProfileService";
import competitionFollowService from "../../spectator/services/competitionFollowService";
import appTheme from "../../../common/theme/appTheme";
import {
  competitionStatusColor,
  competitionStatusLabel,
} from "../../spectator/utils/competitionStatus";
import { useAuth } from "../../../common/contexts/AuthContext";
import { useNotificationUnread } from "../../../common/contexts/NotificationUnreadContext";
import { getSpectatorDisplayFirstName } from "../../../common/utils/spectatorWelcomeName";
import { stripHtmlTags } from "../../../common/utils/htmlUtils";
import HtmlContent from "../../../common/components/HtmlContent";
import SpectatorSocialShell from "../../spectator/components/SpectatorSocialShell";

const pageInk = "#0f2744";
const pageMuted = "#475569";
const pageBorder = "rgba(15, 39, 68, 0.1)";

export default function Spectator() {
  const { user } = useAuth();
  const { unreadCount } = useNotificationUnread();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const viewParam = searchParams.get("view"); // null | "followed" | "followed_results"
  const tabParam = searchParams.get("tab"); // "events" | "competitions" | "results"

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [competitionFavorites, setCompetitionFavorites] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [competitionsByEvent, setCompetitionsByEvent] = useState({});
  const [allCompetitions, setAllCompetitions] = useState([]);
  const [viewMode, setViewMode] = useState("all"); // "all" | "favorites"
  const [competitionSearch, setCompetitionSearch] = useState("");

  const [followedRows, setFollowedRows] = useState([]);
  const [followedLoading, setFollowedLoading] = useState(false);
  const [followedError, setFollowedError] = useState("");
  const [selectedFollowedCompetitionId, setSelectedFollowedCompetitionId] = useState("");
  const [followedCompetitionDetails, setFollowedCompetitionDetails] = useState({});
  const [followedTrialsByCompetition, setFollowedTrialsByCompetition] = useState({});
  const [followedResultsByCompetition, setFollowedResultsByCompetition] = useState({});
  const [followedDataLoading, setFollowedDataLoading] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);

  const eventsCarouselRef = useRef(null);

  useEffect(() => {
    loadEvents();
    loadCompetitionFavorites();
  }, []);

  useEffect(() => {
    setViewMode(modeParam === "favorites" ? "favorites" : "all");
    // Quand on change de vue via le menu, on revient à la sélection "toutes les compétitions"
    setSelectedEventId(null);
  }, [modeParam]);

  const activeKey =
    viewParam === "followed"
      ? "followed"
      : viewParam === "followed_results"
        ? "followed_results"
        : tabParam === "results"
          ? "home"
          : tabParam === "events"
            ? "home"
            : "home";

  useEffect(() => {
    if (viewParam !== "followed" && viewParam !== "followed_results") return;
    let cancelled = false;
    (async () => {
      setFollowedLoading(true);
      setFollowedError("");
      try {
        const list = await competitionFollowService.listFollowed();
        if (cancelled) return;
        setFollowedRows(list);
        const first = list?.[0]?.competitionId != null ? String(list[0].competitionId) : "";
        setSelectedFollowedCompetitionId((prev) => prev || first);
      } catch {
        if (!cancelled) {
          setFollowedRows([]);
          setSelectedFollowedCompetitionId("");
          setFollowedError("Impossible de charger vos compétitions suivies.");
        }
      } finally {
        if (!cancelled) setFollowedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewParam]);

  useEffect(() => {
    if ((viewParam !== "followed" && viewParam !== "followed_results") || followedRows.length === 0) return;
    let cancelled = false;
    (async () => {
      setFollowedDataLoading(true);
      try {
        const ids = followedRows.map((r) => String(r.competitionId));
        const detailEntries = await Promise.all(
          ids.map(async (id) => [id, await spectatorService.getCompetitionById(id)])
        );
        const trialEntries = await Promise.all(
          ids.map(async (id) => [id, await spectatorService.getTrialsByCompetition(id)])
        );
        const resultEntries = await Promise.all(
          ids.map(async (id) => {
            try {
              return [id, await spectatorService.getCompetitionResults(id)];
            } catch {
              return [id, []];
            }
          })
        );
        if (cancelled) return;
        setFollowedCompetitionDetails(Object.fromEntries(detailEntries));
        setFollowedTrialsByCompetition(
          Object.fromEntries(
            trialEntries.map(([id, rows]) => [id, Array.isArray(rows) ? rows : []])
          )
        );
        setFollowedResultsByCompetition(
          Object.fromEntries(
            resultEntries.map(([id, rows]) => [id, Array.isArray(rows) ? rows : []])
          )
        );
      } finally {
        if (!cancelled) setFollowedDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewParam, followedRows]);

  const followedRowsFiltered = useMemo(() => {
    if (!selectedFollowedCompetitionId || selectedFollowedCompetitionId === "ALL") return followedRows;
    return followedRows.filter(
      (r) => String(r.competitionId) === String(selectedFollowedCompetitionId)
    );
  }, [followedRows, selectedFollowedCompetitionId]);

  const followedTrialsFiltered = useMemo(() => {
    const rows = followedRowsFiltered;
    return rows.flatMap((r) => {
      const id = String(r.competitionId);
      const competition = followedCompetitionDetails[id];
      return (followedTrialsByCompetition[id] || [])
        .map((t) => ({
          ...t,
          competitionId: id,
          competitionName: r.competitionName || competition?.name || `Compétition #${id}`,
          eventName: r.eventName || competition?.parentEventName || "Événement",
        }))
        .filter((t) => isUpcomingTrial(t));
    });
  }, [followedRowsFiltered, followedTrialsByCompetition, followedCompetitionDetails]);

  const followedResultsFiltered = useMemo(() => {
    const rows = followedRowsFiltered;
    return rows.flatMap((r) => {
      const id = String(r.competitionId);
      const competition = followedCompetitionDetails[id];
      return (followedResultsByCompetition[id] || []).map((res, idx) => ({
        ...res,
        _k: `${id}-${idx}`,
        competitionId: id,
        competitionName: r.competitionName || competition?.name || `Compétition #${id}`,
      }));
    });
  }, [followedRowsFiltered, followedResultsByCompetition, followedCompetitionDetails]);

  const followedResultGroupsFiltered = useMemo(() => {
    return followedRowsFiltered.flatMap((r) => {
      const id = String(r.competitionId);
      const trials = followedTrialsByCompetition[id] || [];
      const results = followedResultsByCompetition[id] || [];
      return results
        .map((group, idx) => {
        const trialMeta =
          trials.find((t) => String(t.id) === String(group.trialId)) || {};
          return {
            ...group,
            _k: `${id}-group-${idx}`,
            competitionId: id,
            competitionName:
              r.competitionName ||
              followedCompetitionDetails[id]?.name ||
              `Compétition #${id}`,
            eventName:
              r.eventName ||
              followedCompetitionDetails[id]?.parentEventName ||
              "Événement",
            trialMeta,
          };
        })
        .filter((group) => Array.isArray(group.results) && group.results.length > 0);
    });
  }, [
    followedRowsFiltered,
    followedResultsByCompetition,
    followedTrialsByCompetition,
    followedCompetitionDetails,
  ]);

  const openTrialDetails = async (trial) => {
    setSelectedTrial(trial);
    setTrialModalOpen(true);
  };

  const getParticipantName = (row) =>
    row?.participant?.displayName ||
    row?.participant?.name ||
    row?.participantName ||
    row?.athleteName ||
    row?.name ||
    "Participant inconnu";

  const getPerformanceValue = (row) =>
    row?.performanceLabel ||
    row?.performance ||
    row?.time ||
    row?.result ||
    (row?.participant?.status === "FORFEIT" ? "Forfait" : "—");

  const truncateText = (value, max = 180) => {
    const plain = stripHtmlTags(value || "").replace(/\s+/g, " ").trim();
    if (!plain) return "";
    return plain.length > max ? `${plain.slice(0, max)}…` : plain;
  };

  function getTrialStatusLabel(trial) {
    return (
      trial?.statusLabel ||
      trial?.status ||
      trial?.stateLabel ||
      trial?.state ||
      "À venir"
    );
  }

  function getTrialStatusTone(trial) {
    const raw = String(
      trial?.statusLabel || trial?.status || trial?.stateLabel || trial?.state || ""
    ).toUpperCase();
    if (raw.includes("LIVE") || raw.includes("EN_COURS")) {
      return { bg: "rgba(16,185,129,0.14)", color: "#047857", border: "rgba(16,185,129,0.32)" };
    }
    if (raw.includes("TERM") || raw.includes("CLOSED") || raw.includes("END")) {
      return { bg: "rgba(99,102,241,0.12)", color: "#4f46e5", border: "rgba(99,102,241,0.3)" };
    }
    return { bg: "rgba(14,165,233,0.12)", color: "#0369a1", border: "rgba(14,165,233,0.3)" };
  }

  function isUpcomingTrial(trial) {
    const startMs = trial?.startDate ? new Date(trial.startDate).getTime() : null;
    if (!Number.isFinite(startMs)) return false;
    return startMs >= Date.now();
  }

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter]);

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

  const toggleCompetitionSubscription = async (competitionId) => {
    const already = spectatorProfileService.isCompetitionFavorite(competitionId);
    if (already) {
      spectatorProfileService.removeCompetitionFavorite(competitionId);
      try {
        await competitionFollowService.unfollow(competitionId);
      } catch {
        // no-op: fallback local preserved
      }
    } else {
      spectatorProfileService.addCompetitionFavorite(competitionId);
      try {
        await competitionFollowService.follow(competitionId);
      } catch {
        // no-op: fallback local preserved
      }
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

  const eventStatusOptions = useMemo(() => {
    const set = new Set(
      events.map((e) => (e.status ? String(e.status).toUpperCase() : null)).filter(Boolean)
    );
    return ["ALL", ...Array.from(set).sort()];
  }, [events]);

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
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <CircularProgress sx={{ color: "#0891b2" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flex: 1, width: "100%", maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const handleShellNavigate = (key) => {
    if (key === "home") navigate("/spectator");
    if (key === "followed") navigate("/spectator?view=followed");
    if (key === "followed_results") navigate("/spectator?view=followed_results");
    if (key === "map") navigate("/spectator/map");
    if (key === "notifications") navigate("/spectator/notifications");
    if (key === "profile") navigate("/spectator/profile");
    if (key === "tickets") navigate("/spectator/tickets");
  };

  const rightSuggestions = (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${pageBorder}`,
        bgcolor: "rgba(255,255,255,0.94)",
        boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
        p: 2,
      }}
    >
      <Typography sx={{ fontWeight: 900, color: pageInk, mb: 1, letterSpacing: "-0.02em" }}>
        <NotificationsActiveOutlinedIcon sx={{ fontSize: 18, mr: 0.8, color: "#0e7490", verticalAlign: "text-bottom" }} />
        Suggestions compétitions
      </Typography>
      <Typography sx={{ color: pageMuted, fontWeight: 600, fontSize: 13, mb: 1.5 }}>
        Abonnez-vous aux compétitions depuis la colonne droite.
      </Typography>

      <Stack spacing={1.25}>
        {allCompetitions.slice(0, 6).map((c) => {
          const st = competitionStatusColor(c.status);
          const isFollowed = competitionFavoriteIdSet.has(String(c.id));
          return (
            <Paper
              key={c.id}
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${pageBorder}`,
                boxShadow: "0 8px 18px rgba(15,39,68,0.06)",
                borderLeft: `6px solid ${st}`,
                p: 1.25,
              }}
            >
              <Typography sx={{ fontWeight: 900, color: pageInk, fontSize: 13, lineHeight: 1.25 }}>
                {c.name}
              </Typography>
              <Typography sx={{ mt: 0.4, color: pageMuted, fontWeight: 700, fontSize: 12 }}>
                {c.parentEventName || "—"}
              </Typography>
              <Typography sx={{ mt: 0.45, color: pageMuted, fontWeight: 600, fontSize: 11 }}>
                {competitionStatusLabel(c.status, c.statusLabel)}
                {c.startDate ? ` · ${new Date(c.startDate).toLocaleDateString("fr-FR")}` : ""}
              </Typography>
              <Button
                size="small"
                startIcon={<NotificationsActiveOutlinedIcon />}
                onClick={() => toggleCompetitionSubscription(c.id)}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: "999px",
                  px: 1.5,
                  color: isFollowed ? appTheme.colors.violet : "#0e7490",
                  border: isFollowed
                    ? `1px solid ${appTheme.colors.violet}55`
                    : "1px solid rgba(8,145,178,0.25)",
                  bgcolor: isFollowed ? `${appTheme.colors.violet}12` : "rgba(224,242,254,0.6)",
                  "&:hover": { bgcolor: "rgba(224,242,254,0.9)", borderColor: "rgba(8,145,178,0.35)" },
                }}
              >
                {isFollowed ? "Abonné" : "S’abonner"}
              </Button>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );

  const centerContent =
    viewParam === "followed" ? (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: `1px solid ${pageBorder}`,
          bgcolor: "rgba(255,255,255,0.94)",
          boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
        }}
      >
        <Typography sx={{ fontWeight: 900, color: pageInk, letterSpacing: "-0.02em", mb: 0.75 }}>
          <ViewModuleIcon sx={{ fontSize: 20, mr: 0.8, color: "#0891b2", verticalAlign: "text-bottom" }} />
          Compétitions suivies
        </Typography>
        <Typography sx={{ color: pageMuted, fontWeight: 700, fontSize: 13, mb: 2 }}>
          Cliquez sur une chip pour filtrer vos compétitions suivies.
        </Typography>

        {followedError && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
            {followedError}
          </Alert>
        )}

        <Stack direction="row" flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
          <Chip
            label="Toutes"
            onClick={() => setSelectedFollowedCompetitionId("ALL")}
            variant={selectedFollowedCompetitionId === "ALL" ? "filled" : "outlined"}
            sx={{
              fontWeight: 900,
              ...(selectedFollowedCompetitionId === "ALL"
                ? { background: appTheme.gradients.navbar, color: appTheme.colors.dark }
                : { borderColor: pageBorder, color: pageMuted }),
            }}
          />
          {followedRows.map((r) => (
            <Chip
              key={r.competitionId}
              label={r.competitionName || `Compétition #${r.competitionId}`}
              onClick={() => setSelectedFollowedCompetitionId(String(r.competitionId))}
              variant={String(r.competitionId) === String(selectedFollowedCompetitionId) ? "filled" : "outlined"}
              sx={{
                fontWeight: 800,
                ...(String(r.competitionId) === String(selectedFollowedCompetitionId)
                  ? { background: "rgba(224,242,254,0.9)", borderColor: "rgba(8,145,178,0.35)" }
                  : { borderColor: pageBorder, color: pageMuted }),
              }}
            />
          ))}
        </Stack>

        {followedLoading || followedDataLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#0891b2" }} />
          </Box>
        ) : followedRowsFiltered.length === 0 ? (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${pageBorder}`, bgcolor: "#fff" }}>
            <Typography sx={{ color: pageMuted, fontWeight: 700 }}>
              Aucune compétition suivie trouvée pour ce filtre.
            </Typography>
          </Paper>
        ) : followedTrialsFiltered.length === 0 ? (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${pageBorder}`, bgcolor: "#fff" }}>
            <Typography sx={{ color: pageMuted, fontWeight: 700 }}>
              Aucune épreuve à venir pour la compétition sélectionnée.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.25}>
            {followedTrialsFiltered.map((t, idx) => (
              <Paper
                key={`${t.competitionId}-${t.id || idx}`}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: `1px solid ${pageBorder}`,
                  bgcolor: "#fff",
                  boxShadow: "0 4px 14px rgba(15, 39, 68, 0.05)",
                }}
              >
                <Typography sx={{ fontWeight: 900, color: pageInk, fontSize: 14 }}>
                  {t.name || t.trialName || `Épreuve ${t.id || idx + 1}`}
                </Typography>
                <Typography sx={{ mt: 0.35, color: pageMuted, fontWeight: 700, fontSize: 12 }}>
                  {t.competitionName}
                </Typography>
                <Typography sx={{ mt: 0.2, color: pageMuted, fontWeight: 600, fontSize: 12 }}>
                  {t.roundName ? `${t.roundName}` : t.roundNumber ? `Round ${t.roundNumber}` : "Round non défini"}
                </Typography>
                <Stack direction="row" spacing={0.8} sx={{ mt: 0.85, flexWrap: "wrap" }}>
                  {(() => {
                    const st = getTrialStatusTone(t);
                    return (
                      <Chip
                        size="small"
                        label={getTrialStatusLabel(t)}
                        sx={{
                          fontWeight: 800,
                          bgcolor: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border}`,
                        }}
                      />
                    );
                  })()}
                  <Chip
                    icon={<SportsScoreOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={t.mode || "Individuel"}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: "rgba(8,145,178,0.1)", color: "#0e7490" }}
                  />
                  <Chip
                    label={
                      t.startDate
                        ? `Début ${new Date(t.startDate).toLocaleString("fr-FR")}`
                        : "Début non défini"
                    }
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: pageBorder, color: pageMuted, fontWeight: 700 }}
                  />
                  <Chip
                    label={
                      t.endDate
                        ? `Fin ${new Date(t.endDate).toLocaleString("fr-FR")}`
                        : "Fin non définie"
                    }
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: pageBorder, color: pageMuted, fontWeight: 700 }}
                  />
                </Stack>
                {t.description && (
                  <Typography sx={{ mt: 0.8, color: pageInk, fontWeight: 600, fontSize: 12, lineHeight: 1.45 }}>
                    {truncateText(t.description, 220) || "Description non renseignée"}
                  </Typography>
                )}
                <Button
                  size="small"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => openTrialDetails(t)}
                  sx={{
                    mt: 0.9,
                    textTransform: "none",
                    fontWeight: 900,
                    color: "#0e7490",
                  }}
                >
                  Voir détail épreuve
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    ) : viewParam === "followed_results" ? (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: `1px solid ${pageBorder}`,
          bgcolor: "rgba(255,255,255,0.94)",
          boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
        }}
      >
        <Typography sx={{ fontWeight: 900, color: pageInk, letterSpacing: "-0.02em", mb: 0.75 }}>
          <LeaderboardOutlinedIcon sx={{ fontSize: 20, mr: 0.8, color: "#0d9488", verticalAlign: "text-bottom" }} />
          Feed · Résultats & classements (suivis)
        </Typography>
        <Typography sx={{ color: pageMuted, fontWeight: 600, fontSize: 13, mb: 2 }}>
          Tous les résultats disponibles pour vos compétitions suivies.
        </Typography>

        {followedError && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
            {followedError}
          </Alert>
        )}

        <Stack direction="row" flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
          <Chip
            label="Toutes"
            onClick={() => setSelectedFollowedCompetitionId("ALL")}
            variant={selectedFollowedCompetitionId === "ALL" ? "filled" : "outlined"}
            sx={{
              fontWeight: 900,
              ...(selectedFollowedCompetitionId === "ALL"
                ? { background: appTheme.gradients.navbar, color: appTheme.colors.dark }
                : { borderColor: pageBorder, color: pageMuted }),
            }}
          />
          {followedRows.map((r) => (
            <Chip
              key={`results-chip-${r.competitionId}`}
              label={r.competitionName || `Compétition #${r.competitionId}`}
              onClick={() => setSelectedFollowedCompetitionId(String(r.competitionId))}
              variant={String(r.competitionId) === String(selectedFollowedCompetitionId) ? "filled" : "outlined"}
              sx={{
                fontWeight: 800,
                ...(String(r.competitionId) === String(selectedFollowedCompetitionId)
                  ? { background: "rgba(224,242,254,0.9)", borderColor: "rgba(8,145,178,0.35)" }
                  : { borderColor: pageBorder, color: pageMuted }),
              }}
            />
          ))}
        </Stack>

        {followedLoading || followedDataLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#0891b2" }} />
          </Box>
        ) : followedRowsFiltered.length === 0 ? (
          <Typography sx={{ color: pageMuted, fontWeight: 600 }}>
            Aucune compétition suivie pour le moment.
          </Typography>
        ) : followedResultGroupsFiltered.length === 0 ? (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${pageBorder}`, bgcolor: "#fff" }}>
            <Typography sx={{ color: pageMuted, fontWeight: 700 }}>
              Aucun résultat disponible pour la compétition sélectionnée.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {followedResultGroupsFiltered.map((group) => {
              const rows = Array.isArray(group.results) ? group.results : [];
              return (
              <Paper
                key={group._k}
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 2.5,
                  border: `1px solid ${pageBorder}`,
                  bgcolor: "#fff",
                  boxShadow: "0 8px 20px rgba(15,39,68,0.06)",
                }}
              >
                <Typography sx={{ fontWeight: 900, color: pageInk, fontSize: 15 }}>
                  {group.trialMeta?.name || group.trialName || "Épreuve"}
                </Typography>
                <Stack direction="row" spacing={0.8} sx={{ mt: 0.75, mb: 1, flexWrap: "wrap" }}>
                  <Chip label={group.competitionName} size="small" sx={{ fontWeight: 700 }} />
                  <Chip
                    label={group.trialMeta?.roundName || group.roundName || "Round"}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: "rgba(99,102,241,0.12)", color: "#4338ca" }}
                  />
                  <Chip
                    label={group.trialMeta?.mode || "Individuel"}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: "rgba(8,145,178,0.12)", color: "#0e7490" }}
                  />
                  <Chip
                    label={`${rows.length} résultats`}
                    size="small"
                    sx={{ fontWeight: 800, bgcolor: "rgba(15,39,68,0.08)", color: pageInk }}
                  />
                </Stack>

                <Typography sx={{ color: pageMuted, fontWeight: 700, fontSize: 12, mb: 1 }}>
                  Classement officiel de l’épreuve
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900, color: pageInk }}>Rang</TableCell>
                      <TableCell sx={{ fontWeight: 900, color: pageInk }}>Participant</TableCell>
                      <TableCell sx={{ fontWeight: 900, color: pageInk }}>Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={`${group._k}-row-${idx}`}>
                        <TableCell sx={{ color: pageInk, fontWeight: 700 }}>
                          {r.rank ?? r.position ?? "—"}
                        </TableCell>
                        <TableCell sx={{ color: pageInk, fontWeight: 700 }}>
                          {getParticipantName(r)}
                        </TableCell>
                        <TableCell sx={{ color: pageInk, fontWeight: 700 }}>
                          {getPerformanceValue(r)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>
    ) : (
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 2.5,
            borderRadius: 3,
            border: `1px solid ${pageBorder}`,
            bgcolor: "rgba(255,255,255,0.98)",
            boxShadow: "0 8px 32px rgba(15, 39, 68, 0.07)",
          }}
        >
          <Chip
            icon={<LiveTvOutlinedIcon sx={{ fontSize: 18 }} />}
            label="Espace fan"
            size="small"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              bgcolor: "rgba(8,145,178,0.12)",
              color: "#0e7490",
              border: "1px solid rgba(8,145,178,0.22)",
            }}
          />
          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.7rem", sm: "2.15rem" },
              color: pageInk,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            {spectatorWelcomeTitle}
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              color: pageMuted,
              fontSize: { xs: 15, sm: 16 },
              fontWeight: 600,
              maxWidth: 560,
              lineHeight: 1.6,
            }}
          >
            Découvrez les compétitions, enregistrez vos favoris et ouvrez une épreuve en un clic — parcours pensé
            comme un hub sportif, sans tableau de bord technique.
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${pageBorder}`,
            bgcolor: "rgba(255,255,255,0.94)",
            boxShadow: "0 4px 20px rgba(15, 39, 68, 0.05)",
          }}
        >
        <Stack direction="row" flexWrap="wrap" sx={{ gap: 1.25 }}>
          <Button
            variant="outlined"
            startIcon={<PersonOutlineIcon />}
            onClick={() => navigate("/spectator/profile")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              borderColor: "rgba(8,145,178,0.38)",
              color: "#0e7490",
              "&:hover": { borderColor: "#0891b2", bgcolor: "rgba(8,145,178,0.07)" },
            }}
          >
            Mon profil
          </Button>
          <Button
            variant="outlined"
            startIcon={<LeaderboardOutlinedIcon />}
            onClick={() => navigate("/spectator/followed-results")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              borderColor: "rgba(8,145,178,0.42)",
              color: "#0f766e",
              "&:hover": { borderColor: "#0d9488", bgcolor: "rgba(13,148,136,0.08)" },
            }}
          >
            Résultats des suivis
          </Button>
          <Button
            variant="outlined"
            startIcon={<MapOutlinedIcon />}
            onClick={() => navigate("/spectator/map")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              borderColor: "rgba(22,163,74,0.35)",
              color: "#15803d",
              "&:hover": { borderColor: "#16a34a", bgcolor: "rgba(22,163,74,0.08)" },
            }}
          >
            Carte & lieux
          </Button>
          <Button
            variant="outlined"
            startIcon={
              <Badge
                badgeContent={unreadCount > 99 ? "99+" : unreadCount}
                color="error"
                invisible={unreadCount === 0}
                sx={{ "& .MuiBadge-badge": { fontWeight: 800 } }}
              >
                <NotificationsOutlinedIcon />
              </Badge>
            }
            onClick={() => navigate("/spectator/notifications")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              borderColor: "rgba(37,99,235,0.35)",
              color: "#1d4ed8",
              "&:hover": { borderColor: "#2563eb", bgcolor: "rgba(37,99,235,0.06)" },
            }}
          >
            Notifications
          </Button>
        </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.25 },
            mb: 2.5,
            borderRadius: 3,
            border: `1px solid ${pageBorder}`,
            bgcolor: "rgba(255,255,255,0.94)",
            boxShadow: "0 4px 20px rgba(15, 39, 68, 0.05)",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 14, color: pageInk, mb: 1.5 }}>
            <SearchIcon sx={{ fontSize: 18, mr: 0.8, color: "#0e7490", verticalAlign: "text-bottom" }} />
            Filtrer les événements
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Nom ou description d’un événement…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: pageMuted, fontSize: 22 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#fff",
                fontWeight: 600,
              },
            }}
          />
          <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
            {eventStatusOptions.map((st) => (
              <Chip
                key={st}
                label={st === "ALL" ? "Tous les statuts" : String(st)}
                onClick={() => setStatusFilter(st)}
                variant={statusFilter === st ? "filled" : "outlined"}
                sx={{
                  fontWeight: 700,
                  ...(statusFilter === st
                    ? {
                        background: appTheme.gradients.navbar,
                        color: appTheme.colors.dark,
                        border: "none",
                      }
                    : { borderColor: pageBorder, color: pageMuted }),
                }}
              />
            ))}
          </Stack>
        </Paper>

        <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#0e7490", letterSpacing: "0.06em", mb: 1 }}>
          <LiveTvOutlinedIcon sx={{ fontSize: 17, mr: 0.8, verticalAlign: "text-bottom" }} />
          CHOISIR UN ÉVÉNEMENT
        </Typography>
        <Box sx={{ mb: 3, width: "100%", overflow: "hidden" }}>
          <Box
            role="region"
            aria-label="Filtrer par événement — choisir la vue globale ou un événement"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: { xs: 1.5, sm: 2 },
              py: 1.5,
              flexWrap: "nowrap",
              borderRadius: 3,
              border: `1px solid ${pageBorder}`,
              bgcolor: "rgba(255,255,255,0.92)",
              boxShadow: "0 4px 18px rgba(15, 39, 68, 0.06)",
            }}
          >
          <IconButton
            onClick={() => scrollCarousel(eventsCarouselRef, "left")}
            sx={{
              color: pageInk,
              bgcolor: "rgba(248,250,252,1)",
              border: `1px solid ${pageBorder}`,
              flex: "0 0 auto",
              width: 40,
              height: 40,
              borderRadius: "999px",
              "&:hover": { bgcolor: "rgba(224,242,254,0.9)", borderColor: "rgba(8,145,178,0.35)" },
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
                      color: appTheme.colors.dark,
                      border: "1px solid rgba(15,23,42,0.08)",
                      boxShadow: "0 6px 20px rgba(34, 211, 238, 0.25)",
                    }
                  : {
                      backgroundImage: "none",
                      backgroundColor: "#fff",
                      color: pageInk,
                      border: `1px solid ${pageBorder}`,
                      boxShadow: "none",
                    }),
                whiteSpace: "nowrap",
                maxWidth: { xs: 200, sm: 300 },
                '& .MuiButton-startIcon': { marginRight: 0 },
                "&:hover": {
                  ...(selectedEventId === null
                    ? {
                        backgroundImage: appTheme.gradients.navbar,
                        filter: "brightness(0.97)",
                        boxShadow: "0 8px 24px rgba(15, 39, 68, 0.12)",
                      }
                    : {
                        backgroundColor: "rgba(224,242,254,0.5)",
                        borderColor: "rgba(8,145,178,0.35)",
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
                    opacity: 0.85,
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
                            color: appTheme.colors.dark,
                            border: "1px solid rgba(15,23,42,0.08)",
                            boxShadow: "0 6px 20px rgba(34, 211, 238, 0.22)",
                          }
                        : {
                            backgroundImage: "none",
                            backgroundColor: "#fff",
                            color: pageInk,
                            border: `1px solid ${pageBorder}`,
                            boxShadow: "none",
                          }),
                      "&:hover": {
                        ...(isSelected
                          ? {
                              backgroundImage: appTheme.gradients.navbar,
                              filter: "brightness(0.97)",
                              boxShadow: "0 8px 24px rgba(15, 39, 68, 0.1)",
                            }
                          : {
                              backgroundColor: "rgba(224,242,254,0.45)",
                              borderColor: "rgba(8,145,178,0.3)",
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
              color: pageInk,
              bgcolor: "rgba(248,250,252,1)",
              border: `1px solid ${pageBorder}`,
              "&:hover": { bgcolor: "rgba(224,242,254,0.9)", borderColor: "rgba(8,145,178,0.35)" },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

        <Divider sx={{ my: 3, borderColor: pageBorder }} />

        <Stack spacing={2} sx={{ mt: 0, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "flex-start" },
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0, maxWidth: { md: 520 }, py: { xs: 0.5, sm: 0.75 }, px: { xs: 0, sm: 0.25 } }}>
              <Typography
                component="h2"
                sx={{
                  color: pageInk,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.35rem", sm: "1.5rem" },
                  lineHeight: 1.25,
                }}
              >
                {selectedEventId !== null
                  ? "Compétitions de l’événement"
                  : viewMode === "favorites"
                    ? "Vos compétitions suivies"
                    : "À l’affiche"}
              </Typography>
              {selectedEventId === null && competitionsFiltered.length > 0 && (
                <Typography sx={{ mt: 1, lineHeight: 1.55, fontSize: 15, fontWeight: 600, color: pageMuted }}>
                  {competitionsFiltered.length} compétition
                  {competitionsFiltered.length !== 1 ? "s" : ""} disponibles.
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

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${pageBorder}`,
            bgcolor: "rgba(255,255,255,0.96)",
            boxShadow: "0 4px 20px rgba(15, 39, 68, 0.05)",
          }}
        >
          <Typography sx={{ color: pageInk, fontWeight: 900, mb: 0.5 }}>
            Sélectionnez un événement pour continuer
          </Typography>
          <Typography sx={{ color: pageMuted, fontWeight: 700, fontSize: 13 }}>
            Les cartes détaillées des compétitions sont déplacées dans les vues « Compétitions suivies » et
            « Résultats & classements ».
          </Typography>
        </Paper>
      </Box>
    );

  return (
    <>
      <SpectatorSocialShell
        activeKey={activeKey}
        onNavigate={handleShellNavigate}
        unreadCount={unreadCount}
        leftTitle="Espace fan"
        center={centerContent}
        right={rightSuggestions}
        hideRight={false}
      />

      <Dialog
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              border: "1px solid rgba(14,165,233,0.22)",
              background:
                "linear-gradient(165deg, rgba(255,255,255,0.99) 0%, rgba(236,253,245,0.92) 52%, rgba(224,242,254,0.95) 100%)",
              boxShadow: "0 22px 52px rgba(15,39,68,0.18)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: pageInk,
            borderBottom: "1px solid rgba(14,165,233,0.2)",
            background:
              "linear-gradient(90deg, rgba(224,242,254,0.9), rgba(236,253,245,0.9))",
          }}
        >
          {selectedTrial?.name || "Détail de l’épreuve"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedTrial && (
            <Stack spacing={1}>
              <Typography sx={{ color: pageMuted, fontWeight: 700, fontSize: 13 }}>
                {selectedTrial.competitionName} · {selectedTrial.eventName}
              </Typography>
              {(() => {
                const st = getTrialStatusTone(selectedTrial);
                return (
                  <Chip
                    size="small"
                    label={`Statut : ${getTrialStatusLabel(selectedTrial)}`}
                    sx={{
                      alignSelf: "flex-start",
                      fontWeight: 800,
                      bgcolor: st.bg,
                      color: st.color,
                      border: `1px solid ${st.border}`,
                    }}
                  />
                );
              })()}
              <Typography sx={{ color: pageInk, fontWeight: 700, fontSize: 13 }}>
                {selectedTrial.phaseName || selectedTrial.phase || "Phase non définie"}
                {selectedTrial.roundName
                  ? ` · ${selectedTrial.roundName}`
                  : selectedTrial.roundNumber
                    ? ` · Round ${selectedTrial.roundNumber}`
                    : ""}
              </Typography>
              <Typography sx={{ color: pageMuted, fontWeight: 700, fontSize: 12 }}>
                Début:{" "}
                {selectedTrial.startDate
                  ? new Date(selectedTrial.startDate).toLocaleString("fr-FR")
                  : "non défini"}
              </Typography>
              <Typography sx={{ color: pageMuted, fontWeight: 700, fontSize: 12 }}>
                Fin:{" "}
                {selectedTrial.endDate
                  ? new Date(selectedTrial.endDate).toLocaleString("fr-FR")
                  : "non définie"}
              </Typography>
              <Typography sx={{ color: pageInk, fontWeight: 700, fontSize: 12 }}>
                Description:
              </Typography>
              <Box sx={{ color: pageInk, fontWeight: 600, fontSize: 12, lineHeight: 1.5 }}>
                {selectedTrial.description ? (
                  <HtmlContent html={selectedTrial.description} />
                ) : (
                  "non renseignée"
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
