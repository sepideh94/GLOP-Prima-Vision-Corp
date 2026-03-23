import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Link,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import appTheme from "../../../common/theme/appTheme";
import publicResultsService from "../../spectator/services/publicResultsService";
import eventService from "../../../common/api/eventService";

const INK = "#0f172a";
const INK_MUTED = "#64748b";
/** Incrémenter après remplacement de fichiers dans `public/images/home/` pour forcer le rechargement (cache navigateur). */
const HOME_IMAGES_VERSION = "20250324e";
/** Fichiers locaux `public/images/home/` */
const pub = (file) => {
  const base = `${import.meta.env.BASE_URL}images/home/${file}`.replace(/([^:]\/)\/+/g, "$1");
  return `${base}?v=${HOME_IMAGES_VERSION}`;
};
/** Hero : natation (visuel principal demandé) */
const HERO_IMG = pub("hero-natation.jpg");
/** Bandeau sous le hero : disciplines variées (la natation est surtout au hero) */
const SPORTS_STRIP = [
  pub("sport-athletisme.jpg"),
  pub("sport-football.jpg"),
  pub("sport-basket.jpg"),
  pub("sport-course.jpg"),
  pub("sport-tribunes.jpg"),
  pub("hero-stade.jpg"),
];
/** Rotation pour vignettes compétitions / événements (variété, peu de doublons) */
const SPORTS_THUMB_POOL = [
  pub("sport-athletisme.jpg"),
  pub("sport-football.jpg"),
  pub("sport-basket.jpg"),
  pub("sport-course.jpg"),
  pub("sport-tribunes.jpg"),
  pub("sport-equipe.jpg"),
  pub("nat-01-piscine.jpg"),
  pub("swim2.jpg"),
];
/** Cartes d’accueil (spectateurs) — visuels alignés sur le contenu de chaque carte. */
const IMG_HIGHLIGHT_CLASSEMENT = pub("nat-01-piscine.jpg");
const IMG_HIGHLIGHT_AGENDA = pub("sport-athletisme.jpg");
const IMG_HIGHLIGHT_COMPTE = pub("sport-equipe.jpg");
const CTA_BG = pub("sport-athletisme.jpg");
function sportThumbAt(index) {
  const n = SPORTS_THUMB_POOL.length;
  return SPORTS_THUMB_POOL[((index % n) + n) % n];
}
/** Fond clair + dégradés plus marqués (bleu · vert · violet · ambre) */
const PAGE_BG = `
  radial-gradient(circle at 12% 18%, rgba(34,211,238,0.32) 0%, transparent 42%),
  radial-gradient(circle at 88% 12%, rgba(167,139,250,0.28) 0%, transparent 40%),
  radial-gradient(circle at 50% 92%, rgba(74,222,128,0.22) 0%, transparent 48%),
  radial-gradient(circle at 70% 40%, rgba(251,146,60,0.12) 0%, transparent 35%),
  linear-gradient(168deg, #ecfeff 0%, #e0f2fe 30%, #f0fdf4 62%, #faf5ff 100%)
`;
const CARD_BORDER = "rgba(15, 23, 42, 0.08)";
const GLASS_LIGHT = "rgba(255, 255, 255, 0.92)";
const PAL = {
  blue: "#0ea5e9",
  blueDeep: "#0369a1",
  cyan: "#22d3ee",
  green: "#4ade80",
  greenDeep: "#16a34a",
  yellow: "#facc15",
  orange: "#fb923c",
  orangeDeep: "#ea580c",
  violet: "#a78bfa",
};

const parseDateSafe = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  // Evite le décalage UTC sur les dates "YYYY-MM-DD".
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const local = new Date(y, mo - 1, d, 12, 0, 0);
    return Number.isNaN(local.getTime()) ? null : local;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const extractCompetitionDatesMap = (events) => {
  const map = new Map();
  if (!Array.isArray(events)) return map;

  const upsert = (id, startDate, endDate) => {
    if (id == null) return;
    const key = Number(id);
    if (Number.isNaN(key)) return;
    const prev = map.get(key) || {};
    map.set(key, {
      startDate: prev.startDate || startDate || null,
      endDate: prev.endDate || endDate || null,
    });
  };

  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const nodeId = node.competitionId ?? node.idCompetition ?? node.competition?.id ?? null;
    const nodeStart = node.startDate ?? node.start_date ?? node.competitionStartDate ?? null;
    const nodeEnd = node.endDate ?? node.end_date ?? node.competitionEndDate ?? null;
    if (nodeId != null && (nodeStart || nodeEnd)) upsert(nodeId, nodeStart, nodeEnd);

    if (Array.isArray(node.competitions)) {
      node.competitions.forEach((comp) => {
        if (!comp || typeof comp !== "object") return;
        upsert(comp.competitionId ?? comp.id ?? comp.idCompetition, comp.startDate, comp.endDate);
      });
    }

    Object.values(node).forEach(visit);
  };

  events.forEach(visit);
  return map;
};

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const navigate = useNavigate();
  const [competitionSummaries, setCompetitionSummaries] = useState([]);
  const [latestTrials, setLatestTrials] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setResultsLoading(true);
        setResultsError(null);
        const [competitions, events] = await Promise.all([
          publicResultsService.getCompetitionsWithResults(),
          eventService.getAllEvents().catch(() => []),
        ]);
        if (cancelled) return;

        const compDatesMap = extractCompetitionDatesMap(events);
        const sortedComp = [...(Array.isArray(competitions) ? competitions : [])]
          .map((competition) => {
            const mapped = compDatesMap.get(Number(competition?.competitionId));
            return {
              ...competition,
              startDate: competition?.startDate || mapped?.startDate || null,
              endDate: competition?.endDate || mapped?.endDate || null,
            };
          })
          .sort((a, b) => {
          const da = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0;
          const db = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0;
          return db - da;
          });
        setCompetitionSummaries(sortedComp.slice(0, 8));

        const trialRows = sortedComp.flatMap((competition) =>
          (Array.isArray(competition?.trialGroups) ? competition.trialGroups : [])
            .map((trialGroup) => {
              const validResults = (Array.isArray(trialGroup?.results) ? trialGroup.results : []).filter(
                (result) => {
                  const hasPerformance =
                    result?.performance !== null &&
                    result?.performance !== undefined &&
                    String(result?.performance).trim() !== "";
                  const isForfeit = result?.participant?.status === "FORFEIT";
                  return hasPerformance || isForfeit;
                }
              );

              if (validResults.length === 0) return null;

              const latestUpdate = validResults
                .map((r) => r?.updatedAt)
                .filter(Boolean)
                .sort((a, b) => new Date(b) - new Date(a))[0] || competition.lastUpdatedAt;

              return {
                competitionId: competition.competitionId,
                competitionName: competition.competitionName,
                trialId: trialGroup.trialId,
                trialDisplayName: trialGroup.trialDisplayName,
                trialName: trialGroup.trialNameFr || trialGroup.nameFr || trialGroup.trialName,
                roundName: trialGroup.roundName,
                roundDisplayName: trialGroup.roundDisplayName,
                categoryGender: trialGroup.categoryGender,
                results: validResults,
                startDate: trialGroup.startDate,
                startHour: trialGroup.startHour,
                endDate: trialGroup.endDate,
                endHour: trialGroup.endHour,
                latestUpdatedAt: latestUpdate,
              };
            })
            .filter(Boolean)
        );

        const parseDate = (value) => {
          if (!value) return null;
          const d = new Date(value);
          return Number.isNaN(d.getTime()) ? null : d;
        };

        const getTrialSortDate = (trial) => {
          const endFromSplit =
            trial?.endDate && trial?.endHour
              ? parseDate(`${trial.endDate}T${trial.endHour}`)
              : null;
          const startFromSplit =
            trial?.startDate && trial?.startHour
              ? parseDate(`${trial.startDate}T${trial.startHour}`)
              : null;
          return (
            endFromSplit ||
            startFromSplit ||
            parseDate(trial.latestUpdatedAt) ||
            new Date(0)
          ).getTime();
        };

        trialRows.sort((a, b) => getTrialSortDate(b) - getTrialSortDate(a));
        setLatestTrials(trialRows.slice(0, 3));

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const ev = [...(Array.isArray(events) ? events : [])]
          .filter((e) => {
            if (!e?.startDate) return false;
            const start = parseDateSafe(e.startDate);
            if (Number.isNaN(start.getTime())) return false;
            // Agenda: uniquement les événements à venir (pas ceux déjà en cours).
            // On compare au début de journée pour éviter les décalages de fuseau.
            return start >= startOfToday;
          })
          .sort((a, b) => parseDateSafe(a.startDate) - parseDateSafe(b.startDate))
          .slice(0, 3);
        setRecentEvents(ev);
      } catch (e) {
        if (!cancelled) {
          setCompetitionSummaries([]);
          setLatestTrials([]);
          setRecentEvents([]);
          setResultsError("Impossible de charger certaines données publiques pour le moment.");
        }
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatPublishedShort = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatScheduleLine = (startDate, startHour, endDate, endHour) => {
    if (!startDate || !startHour) return null;
    const start = new Date(`${startDate}T${startHour}`);
    const end = endDate && endHour ? new Date(`${endDate}T${endHour}`) : null;
    if (Number.isNaN(start.getTime())) return null;
    const day = start.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const startTime = start.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    if (!end || Number.isNaN(end.getTime())) return `${day} · ${startTime}`;
    const sameDay = start.toDateString() === end.toDateString();
    const endTime = end.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    if (sameDay) return `${day} · ${startTime} – ${endTime}`;
    const endFull = end.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} ${startTime} → ${endFull}`;
  };

  const prettifyEnum = (value) => {
    if (!value || typeof value !== "string") return "Non défini";
    return value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getGenderLabel = (value) => {
    const key = String(value || "").toUpperCase();
    if (key === "MALE" || key === "MEN") return "Homme";
    if (key === "FEMALE" || key === "WOMEN") return "Femme";
    if (key === "MIXED") return "Mixte";
    return prettifyEnum(value);
  };

  const getRoundLabel = (value) => {
    const key = String(value || "").toUpperCase();
    const map = {
      QUALIFICATION_HEAT: "Série de qualification",
      QUALIFICATION: "Qualification",
      SEMI_FINAL: "Demi-finale",
      FINAL: "Finale",
      FINALE: "Finale",
      HEAT: "Série",
    };
    return map[key] || prettifyEnum(value);
  };

  const getTrialNameLabel = (value) => {
    const key = String(value || "").toUpperCase();
    const map = {
      FIFTY_M_FREESTYLE: "50m nage libre",
      ONE_HUNDRED_M_FREESTYLE: "100m nage libre",
      TWO_HUNDRED_M_FREESTYLE: "200m nage libre",
      FIVE_HUNDRED_M_FREESTYLE: "500m nage libre",
      FIFTY_M_BUTTERFLY: "50m papillon",
      ONE_HUNDRED_M_BUTTERFLY: "100m papillon",
      TWO_HUNDRED_M_BUTTERFLY: "200m papillon",
      FIFTY_M_BACKSTROKE: "50m dos",
      ONE_HUNDRED_M_BACKSTROKE: "100m dos",
      TWO_HUNDRED_M_BACKSTROKE: "200m dos",
      FIFTY_M_BREASTSTROKE: "50m brasse",
      ONE_HUNDRED_M_BREASTSTROKE: "100m brasse",
      TWO_HUNDRED_M_BREASTSTROKE: "200m brasse",
      TWO_HUNDRED_M_MEDLEY: "200m 4 nages",
      FOUR_HUNDRED_M_MEDLEY: "400m 4 nages",
      RELAY_4X100M_FREESTYLE: "Relais 4x100m nage libre",
      RELAY_4X200M_FREESTYLE: "Relais 4x200m nage libre",
      RELAY_4X100M_MEDLEY: "Relais 4x100m 4 nages",
      CENT_METRES: "100 mètres",
    };
    if (map[key]) return map[key];

    const wordsToNumber = {
      FIFTY: "50",
      ONE_HUNDRED: "100",
      TWO_HUNDRED: "200",
      THREE_HUNDRED: "300",
      FOUR_HUNDRED: "400",
      FIVE_HUNDRED: "500",
      EIGHT_HUNDRED: "800",
      ONE_THOUSAND: "1000",
      ONE_THOUSAND_FIVE_HUNDRED: "1500",
    };

    let normalized = key;
    Object.entries(wordsToNumber).forEach(([wordKey, numberValue]) => {
      normalized = normalized.replace(wordKey, numberValue);
    });

    const tokenMap = {
      FREESTYLE: "nage libre",
      BACKSTROKE: "dos",
      BREASTSTROKE: "brasse",
      BUTTERFLY: "papillon",
      MEDLEY: "4 nages",
      RELAY: "Relais",
      MIXED: "mixte",
      MEN: "hommes",
      MALE: "hommes",
      WOMEN: "femmes",
      FEMALE: "femmes",
      OPEN: "open",
    };

    Object.entries(tokenMap).forEach(([en, frValue]) => {
      normalized = normalized.replace(new RegExp(`\\b${en}\\b`, "g"), frValue);
    });

    normalized = normalized
      .replace(/(\d+)_M\b/g, "$1m")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b(\d+)X(\d+)M\b/gi, (_, a, b) => `${a}x${b}m`);

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const getFrenchTrialLabelFromText = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const key = raw.toUpperCase().replace(/\s+/g, " ").trim();
    const textMap = {
      "FIFTY M FREESTYLE": "50m nage libre",
      "ONE HUNDRED M FREESTYLE": "100m nage libre",
      "TWO HUNDRED M FREESTYLE": "200m nage libre",
      "FIVE HUNDRED M FREESTYLE": "500m nage libre",
      "FIFTY M BUTTERFLY": "50m papillon",
      "ONE HUNDRED M BUTTERFLY": "100m papillon",
      "TWO HUNDRED M BUTTERFLY": "200m papillon",
      "FIFTY M BACKSTROKE": "50m dos",
      "ONE HUNDRED M BACKSTROKE": "100m dos",
      "TWO HUNDRED M BACKSTROKE": "200m dos",
      "FIFTY M BREASTSTROKE": "50m brasse",
      "ONE HUNDRED M BREASTSTROKE": "100m brasse",
      "TWO HUNDRED M BREASTSTROKE": "200m brasse",
      "TWO HUNDRED M MEDLEY": "200m 4 nages",
      "FOUR HUNDRED M MEDLEY": "400m 4 nages",
    };
    return textMap[key] || null;
  };

  const getDisplayTrialName = (value) => {
    const frenchFromText = getFrenchTrialLabelFromText(value);
    if (frenchFromText) return frenchFromText;
    return getTrialNameLabel(value);
  };

  const highlights = useMemo(
    () => [
      {
        icon: <LeaderboardIcon sx={{ fontSize: 34, color: PAL.cyan }} />,
        title: "Classements et résultats en direct",
        text: "Tableaux officiels à jour : positions, temps et scores au fil des séries et des finales.",
        accent: PAL.cyan,
        image: IMG_HIGHLIGHT_CLASSEMENT,
      },
      {
        icon: <EventAvailableIcon sx={{ fontSize: 34, color: PAL.green }} />,
        title: "Agenda, épreuves et horaires",
        text: "Calendrier clair pour savoir quoi suivre et à quel moment, sur place ou depuis chez vous.",
        accent: PAL.green,
        image: IMG_HIGHLIGHT_AGENDA,
      },
      {
        icon: <LockOutlinedIcon sx={{ fontSize: 34, color: PAL.violet }} />,
        title: "Compte spectateur sécurisé",
        text: "Inscription et connexion protégées pour enregistrer vos favoris et votre suivi personnalisé.",
        accent: PAL.violet,
        image: IMG_HIGHLIGHT_COMPTE,
      },
    ],
    []
  );

  const whyCiblOrga = useMemo(
    () => [
      {
        Icon: CalendarMonthOutlinedIcon,
        title: "Programme, horaires, résultats et classements",
        text: "Retrouvez calendrier, épreuves et tableaux officiels au même endroit, sans jongler entre plusieurs sources.",
        accent: "#facc15",
        accentEnd: "#eab308",
      },
      {
        Icon: LanguageOutlinedIcon,
        title: "Consultez où vous voulez, quand vous voulez",
        text: "Depuis les tribunes, la maison ou en déplacement : tout s’affiche clairement sur téléphone ou ordinateur.",
        accent: PAL.blue,
        accentEnd: "#0369a1",
      },
      {
        Icon: GroupsOutlinedIcon,
        title: "Compte spectateur et compétitions suivies",
        text: "Créez votre compte, ajoutez les épreuves qui vous intéressent et gardez un œil sur l’essentiel.",
        accent: PAL.green,
        accentEnd: PAL.greenDeep,
      },
      {
        Icon: HealthAndSafetyOutlinedIcon,
        title: "Infos pratiques sur les lieux",
        text: "Accès, horaires d’ouverture, plans d’accès et consignes utiles pour profiter sereinement de l’événement.",
        accent: PAL.violet,
        accentEnd: "#6d28d9",
      },
      {
        Icon: FactCheckOutlinedIcon,
        title: "Résultats et classements en direct",
        text: "Suivez les séries et finales en temps réel avec les scores et positions officiels mis à jour au fil de la compétition.",
        accent: PAL.orange,
        accentEnd: PAL.orangeDeep,
      },
      {
        Icon: HubOutlinedIcon,
        title: "Plusieurs sports, une seule vitrine",
        text: "Explorez différentes compétitions et disciplines depuis la même plateforme, selon ce qui vous passionne.",
        accent: "#e879f9",
        accentEnd: "#a855f7",
      },
    ],
    []
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: PAGE_BG,
        backgroundAttachment: "fixed",
        fontFamily: appTheme.typography.fontFamily,
      }}
    >
      {/* Navigation — même teinte que le footer de cette page */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          bgcolor: "#020617",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(148,163,184,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${PAL.blue}, ${PAL.cyan} 45%, ${PAL.green})`,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 8px 24px rgba(14, 165, 233, 0.45)`,
                }}
              >
                <EmojiEventsIcon sx={{ color: "#fff", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 18, color: "#f8fafc", letterSpacing: "-0.02em" }}>
                  CiblOrgaSport
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: PAL.cyan,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  Compétitions · Organisation · Résultats
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                  borderRadius: 999,
                  px: 2.5,
                  py: 0.9,
                  fontSize: 14,
                  color: "#0c4a6e",
                  background: "linear-gradient(180deg, #e0f2fe 0%, #bae6fd 45%, #7dd3fc 100%)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 4px 18px rgba(125, 211, 252, 0.55)",
                  "&:hover": {
                    background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
                    color: "#075985",
                    boxShadow: "0 6px 22px rgba(224, 242, 254, 0.65)",
                  },
                }}
              >
                Connexion
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                  borderRadius: 999,
                  px: 2.75,
                  py: 0.85,
                  fontSize: 14,
                  color: "#0f172a",
                  background: "linear-gradient(92deg, #fde047 0%, #facc15 45%, #fbbf24 100%)",
                  boxShadow: "0 6px 22px rgba(250, 204, 21, 0.5)",
                  "&:hover": {
                    background: "linear-gradient(92deg, #fef08a 0%, #fde047 50%, #f59e0b 100%)",
                    boxShadow: "0 8px 28px rgba(245, 158, 11, 0.45)",
                  },
                }}
              >
                Inscription
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero — natation, hauteur réduite pour laisser voir la bande photos */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "min(46vh, 400px)", sm: "min(44vh, 420px)", md: "min(42vh, 440px)" },
          display: "flex",
          alignItems: "center",
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            /* Pas de cadre : lisibilité via un voile ciblé côté texte */
            background: `
              linear-gradient(98deg, rgba(2,6,23,0.58) 0%, rgba(15,23,42,0.32) 34%, rgba(15,23,42,0.1) 56%, rgba(255,255,255,0) 100%),
              linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.18) 100%)
            `,
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 3.5, md: 4.5 } }}>
          <Box sx={{ maxWidth: { xs: "100%", md: "62%" } }}>
            <Chip
              label="Événements sportifs"
              sx={{
                mb: 1.75,
                fontWeight: 800,
                fontSize: 12,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#f8fafc",
                border: "1.5px solid rgba(255,255,255,0.7)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                boxShadow: "0 6px 20px rgba(2,6,23,0.25)",
              }}
            />
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif',
                fontSize: { xs: "2.05rem", sm: "2.65rem", md: "3.1rem" },
                fontWeight: 800,
                lineHeight: 1.12,
                color: "#f8fafc",
                letterSpacing: "-0.022em",
                mb: 1.75,
                maxWidth: 760,
                textShadow: "0 10px 28px rgba(2,6,23,0.55), 0 2px 8px rgba(2,6,23,0.45)",
              }}
            >
              Plateforme digitale des événements sportifs
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Inter", "Segoe UI", sans-serif',
                fontSize: { xs: "1.03rem", md: "1.14rem" },
                color: "rgba(241,245,249,0.96)",
                lineHeight: 1.72,
                mb: 2.4,
                maxWidth: 640,
                fontWeight: 500,
                textShadow: "0 6px 20px rgba(2,6,23,0.45)",
              }}
            >
              Retrouvez toutes les informations essentielles, accédez à vos services et suivez vos événements sportifs
              en quelques clics. Tout votre univers sportif, réuni en un seul endroit.
            </Typography>
            <Box
              component="nav"
              aria-label="Navigation page d’accueil"
              sx={{
                display: "grid",
                width: "100%",
                maxWidth: "100%",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: { xs: 1.25, sm: 1.5, md: 1.5 },
                alignItems: "stretch",
              }}
            >
              {[
                {
                  label: "À propos de nous",
                  sectionId: "section-pourquoi",
                  bg: "linear-gradient(92deg, #2563eb 0%, #0ea5e9 55%, #22d3ee 100%)",
                  color: "#fff",
                  shadow: "0 6px 20px rgba(14, 165, 233, 0.45)",
                },
                {
                  label: "Compétitions",
                  sectionId: "section-competitions",
                  bg: "linear-gradient(92deg, #166534 0%, #16a34a 45%, #4ade80 100%)",
                  color: "#fff",
                  shadow: "0 6px 20px rgba(22, 163, 74, 0.4)",
                },
                {
                  label: "Agendas et événements",
                  sectionId: "section-agendas",
                  bg: "linear-gradient(92deg, #eab308 0%, #facc15 50%, #fde047 100%)",
                  color: "#0f172a",
                  shadow: "0 6px 20px rgba(234, 179, 8, 0.35)",
                },
                {
                  label: "Derniers classements",
                  sectionId: "section-resultats",
                  bg: "linear-gradient(92deg, #6d28d9 0%, #7c3aed 40%, #a78bfa 100%)",
                  color: "#fff",
                  shadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
                },
              ].map((item) => (
                <Button
                  key={item.label}
                  onClick={() => scrollToSection(item.sectionId)}
                  endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: { xs: 12.5, sm: 13.5, md: 14 },
                    px: { xs: 1.25, sm: 1.5, md: 1.75 },
                    py: { xs: 1.2, md: 1.35 },
                    borderRadius: 999,
                    whiteSpace: "normal",
                    textAlign: "center",
                    lineHeight: 1.3,
                    justifyContent: "center",
                    "& .MuiButton-endIcon": {
                      ml: 0.45,
                      mr: 0,
                    },
                    color: item.color,
                    background: item.bg,
                    boxShadow: item.shadow,
                    border: "2px solid rgba(255,255,255,0.35)",
                    "&:hover": {
                      filter: "brightness(1.06)",
                      boxShadow: `${item.shadow}, 0 0 0 2px rgba(255,255,255,0.5)`,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Bande photos — disciplines variées */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(6, 1fr)" },
          gap: { xs: 0.75, sm: 1 },
          lineHeight: 0,
          px: { xs: 1, sm: 1.5 },
          py: { xs: 1.25, sm: 1.5 },
          bgcolor: "rgba(241, 245, 249, 0.95)",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        {SPORTS_STRIP.map((src, i) => (
          <Box
            key={`sport-strip-${i}`}
            sx={{
              width: "100%",
              minHeight: { xs: 96, sm: 110, md: 122 },
              borderRadius: 1.5,
              overflow: "hidden",
              bgcolor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={src}
              alt="Sport et compétition"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "100%",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
                filter: "contrast(1.06) saturate(1.08)",
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Pourquoi CiblOrgaSport — avantages */}
      <Box
        id="section-pourquoi"
        sx={{
          scrollMarginTop: "80px",
          py: { xs: 6, md: 9 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            opacity: 0.12,
            filter: "saturate(1.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.88) 0%, rgba(236,254,255,0.94) 40%, rgba(250,245,255,0.9) 100%)",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.85rem", md: "2.35rem" },
                fontWeight: 900,
                color: INK,
                letterSpacing: "-0.03em",
                mb: 1.5,
              }}
            >
              Pourquoi CiblOrgaSport ?
            </Typography>
            <Typography
              sx={{
                color: INK_MUTED,
                maxWidth: 720,
                mx: "auto",
                fontSize: { xs: 16, sm: 17 },
                lineHeight: 1.7,
                fontWeight: 500,
              }}
            >
              Une vitrine pensée pour le public : consulter les événements, les horaires, les résultats et les
              classements, créer un compte spectateur et suivre vos compétitions favorites, y compris en direct.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: { xs: 2.25, md: 2.75 },
            }}
          >
            {whyCiblOrga.map((item) => {
              const IconC = item.Icon;
              return (
                <Card
                  key={item.title}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${CARD_BORDER}`,
                    borderLeft: `5px solid ${item.accent}`,
                    bgcolor: "rgba(255,255,255,0.97)",
                    boxShadow: `0 8px 32px rgba(15,23,42,0.07), 0 0 0 1px ${item.accent}22`,
                    transition: "transform 0.22s ease, box-shadow 0.22s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: `0 18px 48px rgba(15,23,42,0.11), 0 0 0 2px ${item.accent}45`,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 2.5,
                        display: "grid",
                        placeItems: "center",
                        mb: 2,
                        background: `linear-gradient(145deg, ${item.accent} 0%, ${item.accentEnd} 100%)`,
                        border: "2px solid rgba(255,255,255,0.55)",
                        boxShadow: `0 10px 28px ${item.accent}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                      }}
                    >
                      <IconC
                        sx={{
                          fontSize: 30,
                          color: "#fff",
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: 16.5, sm: 17.5 },
                        color: INK,
                        mb: 1.25,
                        lineHeight: 1.35,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: INK_MUTED, fontSize: 15, lineHeight: 1.72, fontWeight: 500 }}>
                      {item.text}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* Points forts — spectateurs : visuels alignés sur chaque carte (photo ou bannière icône). */}
      <Box sx={{ py: { xs: 6, md: 8 }, position: "relative" }}>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.65rem", md: "2.1rem" },
              fontWeight: 900,
              color: INK,
              mb: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Tout pour suivre l&apos;événement
          </Typography>
          <Typography sx={{ color: INK_MUTED, mb: 4, maxWidth: 720, fontSize: 16, lineHeight: 1.65 }}>
            Résultats en direct, plannings lisibles et un compte personnel fiable : l’essentiel pour les spectateurs,
            sans jargon d’organisation.
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {highlights.map((h) => (
              <Card
                key={h.title}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${CARD_BORDER}`,
                  bgcolor: GLASS_LIGHT,
                  backdropFilter: "blur(12px)",
                  overflow: "hidden",
                  boxShadow: `0 8px 32px rgba(15,23,42,0.08), 0 0 0 1px ${h.accent}20`,
                  transition: "transform 0.25s, box-shadow 0.25s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: `0 16px 44px rgba(15,23,42,0.12), 0 0 0 2px ${h.accent}40`,
                  },
                }}
              >
                {h.image ? (
                  <Box
                    sx={{
                      height: 160,
                      backgroundImage: `url(${h.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(180deg, transparent 50%, rgba(15,23,42,0.15) 100%)`,
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 160,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      background: `linear-gradient(152deg, ${h.accent}2a 0%, rgba(255,255,255,0.55) 42%, ${h.accent}14 100%)`,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(circle at 50% 40%, ${h.accent}22 0%, transparent 55%)`,
                      },
                    }}
                  >
                    {h.HeroIcon ? (
                      <h.HeroIcon
                        sx={{
                          fontSize: { xs: 76, sm: 84 },
                          color: h.accent,
                          position: "relative",
                          zIndex: 1,
                          opacity: 0.92,
                          filter: "drop-shadow(0 6px 20px rgba(15,23,42,0.12))",
                        }}
                      />
                    ) : null}
                  </Box>
                )}
                <Box
                  sx={{
                    height: 5,
                    background: `linear-gradient(90deg, ${h.accent}, ${PAL.cyan}, ${PAL.violet}, ${PAL.orange})`,
                    boxShadow: `0 0 16px ${h.accent}55`,
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      mb: 2,
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: `${h.accent}18`,
                      border: `1px solid ${h.accent}40`,
                    }}
                  >
                    {h.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 900, fontSize: 18, color: INK, mb: 1 }}>{h.title}</Typography>
                  <Typography sx={{ color: INK_MUTED, fontSize: 15, lineHeight: 1.65 }}>{h.text}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Mise en avant — quelques compétitions */}
      <Box
        id="section-competitions"
        sx={{
          scrollMarginTop: "80px",
          py: { xs: 6, md: 9 },
          background: `linear-gradient(165deg, rgba(224,242,254,0.75) 0%, rgba(255,255,255,0.92) 38%, rgba(237,233,254,0.45) 100%)`,
          borderTop: `1px solid ${CARD_BORDER}`,
          borderBottom: `1px solid ${CARD_BORDER}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "flex-end" },
              justifyContent: "space-between",
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Chip
                label="À la une"
                size="small"
                sx={{
                  mb: 1.25,
                  fontWeight: 800,
                  background: `linear-gradient(90deg, ${PAL.orange}28, ${PAL.yellow}35)`,
                  color: PAL.orangeDeep,
                  border: `2px solid ${PAL.orange}`,
                  boxShadow: `0 4px 14px ${PAL.orange}30`,
                }}
              />
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: "1.75rem", md: "2.15rem" },
                  fontWeight: 900,
                  color: INK,
                  letterSpacing: "-0.03em",
                }}
              >
                Compétitions à la une
              </Typography>
              <Typography sx={{ color: INK_MUTED, mt: 1, maxWidth: 600, lineHeight: 1.7, fontSize: 16 }}>
                Les dernières compétitions publiées avec les informations essentielles : période de déroulement,
                statut actuel et volume d’épreuves classées.
              </Typography>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/competitions")}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                flexShrink: 0,
                px: 2.5,
                py: 1,
                borderRadius: 999,
                color: "#fff",
                background: `linear-gradient(92deg, ${PAL.blueDeep}, ${PAL.cyan} 55%, ${PAL.greenDeep})`,
                boxShadow: `0 8px 26px rgba(14, 165, 233, 0.4)`,
                "&:hover": {
                  background: `linear-gradient(92deg, #075985, ${PAL.blue} 50%, #15803d)`,
                  boxShadow: `0 10px 30px rgba(13, 148, 136, 0.35)`,
                },
              }}
            >
              Toutes les compétitions
            </Button>
          </Box>

          {resultsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: PAL.blue }} />
            </Box>
          ) : competitionSummaries.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                border: `1px dashed ${PAL.orange}44`,
                borderRadius: 3,
                bgcolor: "#fffbeb",
              }}
            >
              <CardContent sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ color: INK_MUTED, fontWeight: 600 }}>
                  Aucune compétition avec résultats publics pour le moment — revenez après la prochaine
                  publication officielle.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {competitionSummaries.map((c, idx) => {
                const trialGroups = Array.isArray(c.trialGroups) ? c.trialGroups : [];
                const nTrials = trialGroups.length;
                const stripe = [PAL.cyan, PAL.green, PAL.violet, PAL.orange][idx % 4];
                const classifiedTrials = trialGroups.filter(
                  (tg) => Array.isArray(tg?.results) && tg.results.length > 0
                ).length;
                const roundCount = new Set(trialGroups.map((tg) => tg?.roundName).filter(Boolean)).size;
                const compStart = parseDateSafe(c?.startDate);
                const compEnd = parseDateSafe(c?.endDate);
                const startAt = compStart && !Number.isNaN(compStart.getTime()) ? compStart : null;
                const endAt = compEnd && !Number.isNaN(compEnd.getTime()) ? compEnd : null;
                const formatDateOnly = (d) =>
                  d
                    ? d.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Non renseignée";
                const durationDays =
                  startAt && endAt
                    ? Math.max(1, Math.ceil((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                    : null;
                const now = new Date();
                const statusLabel = startAt && endAt ? (now < startAt ? "À venir" : now > endAt ? "Terminée" : "En cours") : "Planifiée";
                return (
                  <Card
                    key={c.competitionId}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${CARD_BORDER}`,
                      bgcolor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      boxShadow: `0 12px 36px rgba(15,23,42,0.09), 0 0 0 1px ${stripe}14`,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: `0 20px 48px rgba(15,23,42,0.12), 0 0 0 2px ${stripe}38`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.25,
                        background: `linear-gradient(108deg, ${stripe}2f 0%, rgba(255,255,255,0.94) 44%, ${PAL.blue}24 100%)`,
                        borderBottom: `1px solid ${CARD_BORDER}`,
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, color: INK, fontSize: 13.5, letterSpacing: "0.01em" }}>
                        Compétition à la une
                      </Typography>
                      <Chip
                        size="small"
                        label={statusLabel}
                        sx={{
                          fontWeight: 800,
                          bgcolor:
                            statusLabel === "En cours"
                              ? `${PAL.green}24`
                              : statusLabel === "Terminée"
                                ? `${PAL.blue}1f`
                                : `${PAL.orange}24`,
                          color:
                            statusLabel === "En cours"
                              ? PAL.greenDeep
                              : statusLabel === "Terminée"
                                ? PAL.blueDeep
                                : PAL.orangeDeep,
                        }}
                      />
                    </Box>
                    <Box sx={{ height: 5, background: `linear-gradient(90deg, ${stripe}, ${PAL.blue}, ${PAL.cyan})` }} />
                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3, width: "100%" }}>
                      <Typography sx={{ fontWeight: 900, color: INK, fontSize: 19, mb: 1.25, lineHeight: 1.3 }}>
                        {c.competitionName || `Compétition ${c.competitionId}`}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" sx={{ mb: 1.5, gap: 0.75 }}>
                        <Chip
                          size="small"
                          label={nTrials > 0 ? `${nTrials} épreuve${nTrials > 1 ? "s" : ""}` : "Épreuves à venir"}
                          sx={{ fontWeight: 800, bgcolor: `${PAL.cyan}26`, color: PAL.blueDeep }}
                        />
                        <Chip
                          size="small"
                          label={`${classifiedTrials} épreuve${classifiedTrials > 1 ? "s" : ""} classée${classifiedTrials > 1 ? "s" : ""}`}
                          sx={{ fontWeight: 800, bgcolor: `${PAL.violet}22`, color: "#6d28d9" }}
                        />
                      </Stack>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1.35,
                          borderRadius: 2,
                          bgcolor: `${stripe}12`,
                          border: `1px solid ${stripe}44`,
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>
                            Début
                          </Typography>
                          <Typography sx={{ fontSize: 14, color: INK, fontWeight: 800 }}>{formatDateOnly(startAt)}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>
                            Fin
                          </Typography>
                          <Typography sx={{ fontSize: 14, color: INK, fontWeight: 800 }}>{formatDateOnly(endAt)}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>
                            Durée
                          </Typography>
                          <Typography sx={{ fontSize: 14, color: INK, fontWeight: 800 }}>
                            {durationDays ? `${durationDays} jour${durationDays > 1 ? "s" : ""}` : "À confirmer"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>
                            Phases
                          </Typography>
                          <Typography sx={{ fontSize: 14, color: INK, fontWeight: 800 }}>
                            {roundCount > 0 ? `${roundCount} phase${roundCount > 1 ? "s" : ""}` : "Non précisé"}
                          </Typography>
                        </Box>
                      </Box>
                      {statusLabel === "Terminée" && (
                        <Button
                          onClick={() => goToCompetitionResults(navigate, c.competitionId)}
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            mt: 1.4,
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: 999,
                            alignSelf: "flex-start",
                            px: 2,
                            py: 0.75,
                            color: "#fff",
                            background: `linear-gradient(92deg, ${PAL.blueDeep}, ${PAL.blue})`,
                            boxShadow: "0 8px 22px rgba(3,105,161,0.28)",
                            "&:hover": {
                              background: `linear-gradient(92deg, ${PAL.blueDeep}, #0284c7)`,
                            },
                          }}
                        >
                          Voir les classements
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>

      {/* Agendas — ancre section-agendas (toujours présente pour le scroll depuis le hero) */}
      <Box
        id="section-agendas"
        sx={{
          scrollMarginTop: "80px",
          py: { xs: 5, md: 7 },
          background: `linear-gradient(135deg, rgba(224,242,254,0.85) 0%, rgba(250,245,255,0.75) 50%, rgba(236,253,245,0.8) 100%)`,
          borderTop: `1px solid ${CARD_BORDER}`,
          borderBottom: `1px solid ${CARD_BORDER}`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<EventAvailableIcon sx={{ fontSize: 18 }} />}
              label="Agenda"
              sx={{
                mb: 1.25,
                fontWeight: 800,
                bgcolor: `${PAL.violet}22`,
                color: PAL.violet,
                border: `1px solid ${PAL.violet}44`,
                "& .MuiChip-icon": { color: PAL.violet },
              }}
            />
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.45rem", md: "1.9rem" },
                fontWeight: 900,
                color: INK,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                flexWrap: "wrap",
                letterSpacing: "-0.02em",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: `${PAL.green}22`,
                  border: `2px solid ${PAL.green}55`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CalendarMonthIcon sx={{ color: PAL.greenDeep, fontSize: 30 }} />
              </Box>
              Agenda des événements
            </Typography>
            <Typography sx={{ color: INK_MUTED, mt: 1.25, maxWidth: 640, lineHeight: 1.65, fontSize: 15 }}>
              Les prochains événements à venir, présentés en format agenda avec les informations utiles.
            </Typography>
          </Box>
          {recentEvents.length > 0 ? (
            <Stack spacing={2}>
              {recentEvents.map((ev, evIdx) => {
                const dateLineStart =
                  ev.startDate &&
                  new Date(ev.startDate).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                const dateLineRange =
                  ev.endDate && ev.startDate
                    ? `Au ${new Date(ev.endDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}`
                    : null;
                const startAt = parseDateSafe(ev.startDate);
                const endAt = parseDateSafe(ev.endDate);
                const formatShortDate = (d) =>
                  d
                    ? d.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Non renseignée";
                const durationDays =
                  startAt && endAt
                    ? Math.max(1, Math.ceil((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                    : null;
                return (
                  <Box
                    key={ev.id}
                    sx={{
                      display: "flex",
                      alignItems: "stretch",
                      borderRadius: 3,
                      border: `1px solid ${[PAL.cyan, PAL.violet, PAL.orange][evIdx % 3]}4a`,
                      bgcolor: "#fff",
                      boxShadow: `0 14px 40px rgba(15,23,42,0.1), 0 0 0 1px ${[PAL.cyan, PAL.violet, PAL.orange][evIdx % 3]}24`,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        flexShrink: 0,
                        background: `linear-gradient(180deg, ${[PAL.cyan, PAL.violet, PAL.orange][evIdx % 3]}, ${PAL.blue})`,
                      }}
                    />
                    <Box sx={{ flex: 1, p: 2.5, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mb: 1 }}>
                        <Chip
                          size="small"
                          label="Calendrier"
                          sx={{ fontWeight: 800, bgcolor: `${PAL.cyan}20`, color: PAL.blueDeep }}
                        />
                        <Chip
                          size="small"
                          label="À venir"
                          sx={{ fontWeight: 800, bgcolor: `${PAL.green}24`, color: PAL.greenDeep }}
                        />
                      </Stack>
                      <Typography sx={{ fontWeight: 900, color: INK, fontSize: 18, mb: 0.75 }}>{ev.name}</Typography>
                      <Box
                        sx={{
                          mt: 0.6,
                          p: 1.1,
                          borderRadius: 2,
                          border: `1px solid ${PAL.cyan}55`,
                          bgcolor: `${PAL.cyan}10`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: PAL.blueDeep,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            flexWrap: "wrap",
                          }}
                        >
                          <CalendarMonthIcon sx={{ fontSize: 18, color: PAL.cyan }} />
                          {dateLineStart}
                          {dateLineRange ? ` · ${dateLineRange}` : ""}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.1,
                          borderRadius: 2,
                          border: `1px solid ${PAL.green}55`,
                          bgcolor: `${PAL.green}10`,
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                          gap: 0.9,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>
                            Début
                          </Typography>
                          <Typography sx={{ fontSize: 13.5, color: INK, fontWeight: 800 }}>{formatShortDate(startAt)}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>
                            Fin
                          </Typography>
                          <Typography sx={{ fontSize: 13.5, color: INK, fontWeight: 800 }}>{formatShortDate(endAt)}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11.5, color: INK_MUTED, fontWeight: 800, textTransform: "uppercase" }}>
                            Durée
                          </Typography>
                          <Typography sx={{ fontSize: 13.5, color: INK, fontWeight: 800 }}>
                            {durationDays ? `${durationDays} jour${durationDays > 1 ? "s" : ""}` : "À confirmer"}
                          </Typography>
                        </Box>
                      </Box>
                      {(ev.location || ev.venue || ev.city) && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            borderRadius: 2,
                            border: `1px solid ${PAL.violet}44`,
                            bgcolor: `${PAL.violet}0f`,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: INK_MUTED,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 0.5,
                            }}
                          >
                            <PlaceOutlinedIcon sx={{ fontSize: 18, flexShrink: 0, mt: 0.1 }} />
                            {ev.location || ev.venue || ev.city}
                          </Typography>
                        </Box>
                      )}
                      {ev.description ? (
                        <Typography sx={{ fontSize: 14, color: INK_MUTED, mt: 1.25, lineHeight: 1.6 }}>
                          {String(ev.description).slice(0, 220)}
                          {String(ev.description).length > 220 ? "…" : ""}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Card
              elevation={0}
              sx={{
                border: `1px dashed ${PAL.violet}44`,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.9)",
              }}
            >
              <CardContent sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ color: INK_MUTED, fontWeight: 600 }}>
                  Aucun événement à afficher pour le moment — cette section se remplira lorsque des dates seront
                  publiées dans le calendrier.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      {/* Derniers classements — cartes claires */}
      <Box
        id="section-resultats"
        sx={{
          scrollMarginTop: "80px",
          py: { xs: 6, md: 9 },
          bgcolor: "rgba(255,255,255,0.65)",
          borderTop: `1px solid ${CARD_BORDER}`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.75rem", md: "2.35rem" },
                fontWeight: 900,
                color: INK,
                letterSpacing: "-0.02em",
                mb: 1,
              }}
            >
              Derniers classements à l&apos;affiche
            </Typography>
            <Typography sx={{ color: INK_MUTED, maxWidth: 640, mx: "auto", lineHeight: 1.65 }}>
              Les trois dernières épreuves pour lesquelles un classement a été publié : podium synthétique,
              type de performance et contexte (tour, catégorie).
            </Typography>
          </Box>

          {resultsError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {resultsError}
            </Alert>
          )}

          {resultsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: PAL.blue }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              {latestTrials.length === 0 && !resultsError && (
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Card
                    elevation={0}
                    sx={{
                      border: `1px solid ${CARD_BORDER}`,
                      borderRadius: 3,
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <CardContent sx={{ py: 5, textAlign: "center" }}>
                      <Typography sx={{ color: INK_MUTED, fontWeight: 600 }}>
                        Les tableaux de classement apparaîtront ici après publication par les organisateurs.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {latestTrials.map((trial, tIdx) => {
                const topResults = (trial.results || []).slice(0, 3);
                const hasTeam = topResults.some((r) => r?.participant?.competitorType === "TEAM");
                const modeLabel = hasTeam ? "Équipe" : "Individuel";
                const performanceType = topResults[0]?.performanceType;
                const performanceLabel =
                  performanceType === "TIME" ? "Temps" : performanceType === "POINTS" ? "Points" : "Mesure";

                const accent = [PAL.cyan, PAL.violet, PAL.orange][tIdx % 3];
                const singlePodium = topResults.length === 1;
                const singleCompetitorType = topResults[0]?.participant?.competitorType;
                const singleTeamFinalist = singlePodium && singleCompetitorType === "TEAM";
                const singleAthleteFinalist = singlePodium && singleCompetitorType !== "TEAM";
                const finalistTone = singleTeamFinalist ? PAL.violet : PAL.blueDeep;
                const finalistBg = singleTeamFinalist ? `${PAL.violet}14` : `${PAL.cyan}14`;

                return (
                  <Card
                    key={`${trial.competitionId}-${trial.trialId}`}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${CARD_BORDER}`,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: "#fff",
                      boxShadow: `0 10px 36px rgba(15,23,42,0.08), 0 0 0 1px ${accent}28`,
                    }}
                  >
                    <Box
                      sx={{
                        height: 56,
                        background: singlePodium
                          ? "linear-gradient(105deg, #f59e0b 0%, #facc15 46%, #fde68a 100%)"
                          : `linear-gradient(105deg, ${accent} 0%, ${PAL.blue} 42%, ${PAL.greenDeep}aa 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: singlePodium ? 0.9 : 1.75,
                        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.25)",
                      }}
                    >
                      {singlePodium ? (
                        <>
                          <Typography sx={{ fontSize: 34, lineHeight: 1 }} aria-hidden>
                            🥇
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 900,
                              letterSpacing: "0.03em",
                              color: "#713f12",
                              textTransform: "uppercase",
                            }}
                          >
                            Champion
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography sx={{ fontSize: 28, lineHeight: 1 }} aria-hidden>
                            🥇
                          </Typography>
                          <Typography sx={{ fontSize: 28, lineHeight: 1, opacity: 0.92 }} aria-hidden>
                            🥈
                          </Typography>
                          <Typography sx={{ fontSize: 28, lineHeight: 1, opacity: 0.85 }} aria-hidden>
                            🥉
                          </Typography>
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        px: 2.5,
                        py: 2,
                        bgcolor: "#f8fafc",
                        borderBottom: `1px solid ${CARD_BORDER}`,
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, color: INK, fontSize: 17, mb: 1, lineHeight: 1.35 }}>
                        {getDisplayTrialName(trial.trialName || `Épreuve ${trial.trialId}`)}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: INK_MUTED, fontWeight: 600, mb: 1 }}>
                        {trial.competitionName || `Compétition ${trial.competitionId}`}
                        {(trial.roundName || trial.categoryGender) && " · "}
                        {trial.roundName ? `${getRoundLabel(trial.roundName)}` : ""}
                        {trial.categoryGender ? ` · ${getGenderLabel(trial.categoryGender)}` : ""}
                      </Typography>
                      {(trial.startDate && trial.startHour) || (trial.endDate && trial.endHour) ? (
                        <Typography sx={{ fontSize: 12, color: INK_MUTED }}>
                          {formatScheduleLine(
                            trial.startDate,
                            trial.startHour,
                            trial.endDate,
                            trial.endHour
                          ) || ""}
                        </Typography>
                      ) : null}
                      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                        <Chip
                          size="small"
                          label={modeLabel}
                          sx={{ fontWeight: 800, bgcolor: `${PAL.violet}30`, color: "#5b21b6" }}
                        />
                        <Chip
                          size="small"
                          label={performanceLabel}
                          sx={{ fontWeight: 800, bgcolor: `${PAL.cyan}28`, color: PAL.blueDeep }}
                        />
                      </Stack>
                    </Box>
                    <CardContent
                      sx={{
                        flex: 1,
                        pt: singlePodium ? 3 : 2,
                        pb: singlePodium ? 3 : 2,
                        px: 2,
                        bgcolor: "#fff",
                        display: singlePodium ? "flex" : "block",
                        flexDirection: singlePodium ? "column" : undefined,
                        alignItems: singlePodium ? "center" : undefined,
                      }}
                    >
                      {singlePodium ? (
                        <Box
                          sx={{
                            mb: 1.6,
                            px: 1.4,
                            py: 0.75,
                            borderRadius: 999,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            fontSize: 12,
                            fontWeight: 900,
                            color: finalistTone,
                            bgcolor: finalistBg,
                            border: `1px solid ${finalistTone}44`,
                          }}
                        >
                          {singleTeamFinalist ? (
                            <Groups2RoundedIcon sx={{ fontSize: 16, color: finalistTone }} />
                          ) : (
                            <PersonRoundedIcon sx={{ fontSize: 16, color: finalistTone }} />
                          )}
                          {singleTeamFinalist ? "Finaliste équipe" : "Finaliste athlète"}
                        </Box>
                      ) : null}
                      <Stack
                        spacing={singlePodium ? 2 : 1}
                        sx={{ width: "100%", maxWidth: singlePodium ? 440 : "none" }}
                      >
                        {topResults.map((result) => (
                          <Box
                            key={result.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1.5,
                              py: singlePodium ? 2 : 1.25,
                              px: singlePodium ? 2.5 : 1.5,
                              borderRadius: 2.5,
                              bgcolor: singlePodium ? finalistBg : "#f1f5f9",
                              border: `2px solid ${singlePodium ? `${finalistTone}40` : CARD_BORDER}`,
                              width: "100%",
                            }}
                          >
                            <Typography sx={{ fontWeight: 900, color: PAL.orangeDeep, minWidth: 40, fontSize: singlePodium ? 22 : 18 }}>
                              {result.rank === 1 ? "🥇" : result.rank === 2 ? "🥈" : result.rank === 3 ? "🥉" : result.rank}
                            </Typography>
                            <Typography
                              sx={{
                                flex: 1,
                                fontWeight: 800,
                                fontSize: singlePodium ? 16 : 14,
                                color: singlePodium ? finalistTone : INK,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: singlePodium ? "normal" : "nowrap",
                                textAlign: singlePodium ? "center" : "left",
                              }}
                            >
                              {result?.participant?.displayName || "Participant"}
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: singlePodium ? 16 : 14,
                                color: PAL.greenDeep,
                                flexShrink: 0,
                              }}
                            >
                              {result.performance}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              size="large"
              onClick={() => navigate("/resultats")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 999,
                fontWeight: 900,
                textTransform: "none",
                background: `linear-gradient(90deg, ${PAL.blue}, ${PAL.cyan}, ${PAL.green})`,
                color: "#fff",
                boxShadow: `0 10px 32px rgba(14, 165, 233, 0.4)`,
                "&:hover": {
                  background: `linear-gradient(90deg, ${PAL.blueDeep}, ${PAL.blue}, ${PAL.greenDeep})`,
                },
              }}
            >
              Accéder à tous les classements
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA — photo sport + dégradé vif (lisible, pas « trou noir ») */}
      <Box
        sx={{
          py: { xs: 7, md: 9 },
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          backgroundImage: `url(${CTA_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `linear-gradient(125deg, rgba(14,165,233,0.88) 0%, rgba(34,211,238,0.55) 38%, rgba(234,88,12,0.75) 100%)`,
          },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.65rem", md: "2.15rem" },
              mb: 2,
              textShadow: "0 2px 20px rgba(0,0,0,0.2)",
            }}
          >
            Donnez une nouvelle dimension à vos compétitions
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.95)", mb: 4, fontSize: 17, lineHeight: 1.65 }}>
            Inscrivez-vous pour suivre les compétitions en temps réel, ou connectez-vous avec votre profil
            métier — athlète, commissaire, bénévole ou organisation.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              size="large"
              onClick={() => navigate("/signup")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 999,
                fontWeight: 800,
                textTransform: "none",
                background: `linear-gradient(90deg, ${PAL.yellow}, ${PAL.orange})`,
                color: INK,
                boxShadow: `0 8px 28px rgba(250, 204, 21, 0.35)`,
                "&:hover": { background: `linear-gradient(90deg, #fde047, ${PAL.orangeDeep})` },
              }}
            >
              Créer un compte
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 999,
                fontWeight: 800,
                textTransform: "none",
                borderColor: "rgba(255,255,255,0.5)",
                color: "#fff",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              Se connecter
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Pied de page */}
      <Box
        component="footer"
        sx={{
          py: 5,
          px: 3,
          bgcolor: "#020617",
          borderTop: "1px solid rgba(148,163,184,0.15)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr" },
              gap: 4,
              mb: 4,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, color: "#fff", mb: 1 }}>CiblOrgaSport</Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                Outil de gestion et de communication autour des compétitions sportives et de leurs
                résultats.
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#94a3b8", fontSize: 13, mb: 1.5 }}>Navigation</Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/resultats" sx={{ color: "#cbd5e1", fontSize: 14 }}>
                  Résultats publics
                </Link>
                <Link component={RouterLink} to="/competitions" sx={{ color: "#cbd5e1", fontSize: 14 }}>
                  Toutes les compétitions
                </Link>
                <Link component={RouterLink} to="/login" sx={{ color: "#cbd5e1", fontSize: 14 }}>
                  Connexion
                </Link>
                <Link component={RouterLink} to="/signup" sx={{ color: "#cbd5e1", fontSize: 14 }}>
                  Inscription
                </Link>
              </Stack>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#94a3b8", fontSize: 13, mb: 1.5 }}>Informations</Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                Données affichées à titre informatif selon les publications des organisateurs.
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ color: "#475569", fontSize: 13, textAlign: { xs: "center", md: "left" } }}>
            © {new Date().getFullYear()} CiblOrgaSport — Plateforme de gestion sportive
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
