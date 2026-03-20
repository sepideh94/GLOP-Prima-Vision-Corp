import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import appTheme from "../../../common/theme/appTheme";
import publicResultsService from "../../spectator/services/publicResultsService";

export default function HomePage() {
  const navigate = useNavigate();
  const [latestTrials, setLatestTrials] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  useEffect(() => {
    const loadLatestPublicResults = async () => {
      try {
        setResultsLoading(true);
        setResultsError(null);
        const competitions = await publicResultsService.getCompetitionsWithResults();

        const trialRows = competitions.flatMap((competition) =>
          (Array.isArray(competition?.trialGroups) ? competition.trialGroups : [])
            .filter((trialGroup) => Array.isArray(trialGroup?.results) && trialGroup.results.length > 0)
            .map((trialGroup) => {
              const latestUpdate = trialGroup.results
                .map((r) => r?.updatedAt)
                .filter(Boolean)
                .sort((a, b) => new Date(b) - new Date(a))[0] || competition.lastUpdatedAt;

              return {
                competitionId: competition.competitionId,
                competitionName: competition.competitionName,
                trialId: trialGroup.trialId,
                trialName: trialGroup.trialName,
                roundName: trialGroup.roundName,
                categoryGender: trialGroup.categoryGender,
                startDate: trialGroup.startDate,
                startHour: trialGroup.startHour,
                endDate: trialGroup.endDate,
                endHour: trialGroup.endHour,
                results: trialGroup.results,
                latestUpdatedAt: latestUpdate,
              };
            })
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

        trialRows.sort(
          (a, b) => getTrialSortDate(b) - getTrialSortDate(a)
        );

        setLatestTrials(trialRows.slice(0, 2));
      } catch (e) {
        setLatestTrials([]);
        setResultsError("Impossible de charger les derniers classements pour le moment.");
      } finally {
        setResultsLoading(false);
      }
    };

    loadLatestPublicResults();
  }, []);

  const formatWhen = (iso) => {
    if (!iso) return "Mise à jour non disponible";
    return `Mise à jour: ${new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
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

    if (!end || Number.isNaN(end.getTime())) {
      return `${day} · ${startTime}`;
    }

    const sameDay = start.toDateString() === end.toDateString();
    const endTime = end.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (sameDay) {
      return `${day} · ${startTime} - ${endTime}`;
    }

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
    return map[key] || prettifyEnum(value);
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

  const latestSectionDescription = useMemo(() => {
    if (resultsLoading) return "Chargement des derniers classements publics...";
    if (latestTrials.length === 0) return "Les derniers classements seront affichés ici.";
    return "Dernières épreuves classées avec performances et rangs officiels.";
  }, [resultsLoading, latestTrials.length]);

  const features = [
    {
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      title: "Suivi des compétitions",
      description: "Consultez le calendrier des compétitions et les informations clés de chaque événement en quelques clics simples.",
      color: appTheme.colors.cyan,
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: "Billets numériques",
      description: "Retrouvez vos billets au même endroit et gardez une trace de vos participations aux événements sportifs variés.",
      color: appTheme.colors.violet,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Expérience spectateur",
      description: "Une interface pensée pour les spectateurs avec accès rapide aux compétitions suivies et informations importantes.",
      color: appTheme.colors.green,
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Sécurité & Accès",
      description: "Système d'authentification robuste avec gestion des rôles et permissions pour une sécurité optimale complète.",
      color: appTheme.colors.cyan,
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: "Suivi des Résultats",
      description: "Consultez les résultats, programmes et informations de vos événements en temps réel pour tous les spectateurs.",
      color: appTheme.colors.violet,
    },
    {
      icon: <SportsScoreIcon sx={{ fontSize: 40 }} />,
      title: "Tout au même endroit",
      description: "Une application unique pour suivre vos compétitions, retrouver vos billets et accéder aux résultats en direct complet.",
      color: appTheme.colors.green,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: appTheme.gradients.page,
        fontFamily: appTheme.typography.fontFamily,
        position: "relative",
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          // Image de natation (sport/compétition) en arrière-plan
          backgroundImage:
            "url(https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1975&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            // Overlay moins opaque pour laisser l'image de natation visible derrière le texte
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.25) 0%, rgba(30, 41, 59, 0.18) 50%, rgba(15, 23, 42, 0.25) 100%)",
          },
        }}
      />

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg" sx={{ maxWidth: "1120px !important" }}>
          <Box
            sx={{
              textAlign: "center",
              maxWidth: "900px",
              mx: "auto",
            }}
          >
            {/* Badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 3,
                py: 1,
                borderRadius: "999px",
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                mb: 4,
              }}
            >
              <SportsScoreIcon sx={{ fontSize: 20, color: appTheme.colors.cyan }} />
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: appTheme.colors.textPrimary,
                }}
              >
                CiblOrgaSport
              </Typography>
            </Box>

            {/* Main Title */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem", lg: "5rem" },
                fontWeight: 900,
                lineHeight: 1.1,
                mb: 3,
                background: `linear-gradient(135deg, ${appTheme.colors.textPrimary} 0%, ${appTheme.colors.cyan} 50%, ${appTheme.colors.green} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Plateforme digitale des{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${appTheme.colors.green} 0%, ${appTheme.colors.cyan} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                événements sportifs
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.25rem" },
                color: appTheme.colors.textSecondary,
                mb: 5,
                maxWidth: "700px",
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Retrouvez toutes les informations essentielles, accédez à vos services et suivez vos événements sportifs en quelques clics.
              Tout votre univers sportif, réuni en un seul endroit.
            </Typography>

            {/* CTA Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 8,
              }}
            >
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: appTheme.gradients.navbar,
                  color: "#020617",
                  boxShadow: "0 10px 30px rgba(34, 211, 238, 0.3)",
                  "&:hover": {
                    background: appTheme.gradients.navbar,
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 40px rgba(34, 211, 238, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Se connecter
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                variant="outlined"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  border: `2px solid ${appTheme.colors.green}`,
                  color: appTheme.colors.green,
                  background: "transparent",
                  "&:hover": {
                    border: `2px solid ${appTheme.colors.green}`,
                    background: "rgba(163, 230, 53, 0.1)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                S'inscrire
              </Button>
            </Box>

          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          background: "rgba(255, 255, 255, 0.14)",
          backdropFilter: "blur(10px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                mb: 2,
                color: appTheme.colors.dark,
              }}
            >
              Fonctionnalités principales
            </Typography>
            <Typography
              sx={{
                fontSize: "1.125rem",
                color: appTheme.colors.textSecondary,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Une application dédiée aux spectateurs pour suivre les compétitions, conserver ses billets et consulter les résultats en direct.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)" },
              gap: 4,
              alignItems: "stretch",
            }}
          >
            {features.map((feature, index) => (
              <Box key={index} sx={{ display: "flex" }}>
                <Card
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: appTheme.gradients.card,
                    borderRadius: appTheme.radius.lg,
                    boxShadow: appTheme.shadows.card,
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 25px 50px rgba(0,0,0,0.4), 0 0 0 2px ${feature.color}40`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", flex: 1 }}>
                    <Box
                      sx={{
                        color: feature.color,
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: appTheme.colors.textPrimary,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: appTheme.colors.textSecondary,
                        fontSize: "0.9375rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Latest public results section (before CTA) */}
      <Box
        sx={{
          py: { xs: 7, md: 10 },
          px: { xs: 3, md: 6 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: 4,
              p: { xs: 1, md: 1.6 },
              background: "rgba(15,23,42,0.50)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(148,163,184,0.22)",
              boxShadow: "0 20px 45px rgba(2, 6, 23, 0.32)",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.6 } }}>
              <Box sx={{ mb: 3.2 }}>
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.1, mb: 0.4 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(167,139,250,0.22))",
                        border: "1px solid rgba(34,211,238,0.35)",
                      }}
                    >
                      <LeaderboardIcon sx={{ color: "#67E8F9", fontSize: 20 }} />
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: "1.55rem", md: "2.2rem" },
                        fontWeight: 900,
                        color: appTheme.colors.textPrimary,
                        mb: 0,
                        letterSpacing: "0.01em",
                      }}
                    >
                      Derniers résultats & classements
                    </Typography>
                  </Box>
                  <Typography sx={{ color: appTheme.colors.textSecondary, mt: 0.6 }}>
                    Consultez les performances et classements officiels des dernières épreuves organisées.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-end" },
                    mb: 1.6,
                  }}
                >
                  <Button
                    onClick={() => navigate("/resultats")}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 3.6,
                      py: 1.25,
                      borderRadius: "999px",
                      fontWeight: 900,
                      letterSpacing: "0.01em",
                      textTransform: "none",
                      background: appTheme.gradients.navbar,
                      color: "#020617",
                      boxShadow: "0 12px 30px rgba(34, 211, 238, 0.35)",
                    }}
                  >
                    Tous les classements
                  </Button>
                </Box>
              </Box>

              {resultsError && <Alert severity="error">{resultsError}</Alert>}

              {resultsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                  <CircularProgress sx={{ color: appTheme.colors.cyan }} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(300px, 360px))",
                      md: "repeat(2, minmax(330px, 380px))",
                    },
                    justifyContent: "center",
                    gap: 3,
                  }}
                >
                  {latestTrials.length === 0 && (
                    <Box>
                      <Card
                        sx={{
                          borderRadius: appTheme.radius.lg,
                          background: "rgba(15,23,42,0.75)",
                          border: "1px solid rgba(148, 163, 184, 0.22)",
                        }}
                      >
                        <CardContent>
                          <Typography sx={{ color: "#E2E8F0", fontWeight: 700 }}>
                            Aucun classement public récent trouvé pour le moment.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  )}

                  {latestTrials.map((trial) => {
                    const topResults = (trial.results || []).slice(0, 3);
                    const hasTeam = topResults.some(
                      (r) => r?.participant?.competitorType === "TEAM"
                    );
                    const modeLabel = hasTeam ? "Équipe" : "Individuel";
                    const performanceType = topResults[0]?.performanceType;
                    const performanceLabel =
                      performanceType === "TIME"
                        ? "Temps"
                        : performanceType === "POINTS"
                          ? "Points"
                          : "Performance";

                    return (
                      <Box key={`${trial.competitionId}-${trial.trialId}`} sx={{ display: "flex" }}>
                        <Card
                          sx={{
                            minHeight: 360,
                            height: "100%",
                            width: "100%",
                            borderRadius: appTheme.radius.lg,
                            background:
                              "linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(10,20,52,0.96) 58%, rgba(30,27,75,0.95) 100%)",
                            border: "1px solid rgba(56, 189, 248, 0.26)",
                            boxShadow: "0 16px 36px rgba(15, 23, 42, 0.42)",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <CardContent
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              width: "100%",
                              flex: 1,
                              gap: 1.25,
                              pt: 2,
                              pb: 2,
                              px: 2.25,
                              minHeight: 0,
                              "&:last-child": { pb: 2 },
                            }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: 1,
                                  mb: 0.4,
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#E2E8F0",
                                    fontWeight: 900,
                                    flex: 1,
                                    minWidth: 0,
                                    pr: 1,
                                  }}
                                >
                                  {getDisplayTrialName(trial.trialName || `Épreuve ${trial.trialId}`)}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="nowrap"
                                  sx={{ flexShrink: 0, alignItems: "center" }}
                                >
                                  <Chip
                                    size="small"
                                    label={modeLabel}
                                    sx={{
                                      background: "rgba(167,139,250,0.18)",
                                      color: "#DDD6FE",
                                      border: "1px solid rgba(167,139,250,0.35)",
                                      fontWeight: 800,
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={performanceLabel}
                                    sx={{
                                      background: "rgba(134,239,172,0.14)",
                                      color: "#BBF7D0",
                                      border: "1px solid rgba(134,239,172,0.35)",
                                      fontWeight: 800,
                                    }}
                                  />
                                </Stack>
                              </Box>
                              <Typography
                                sx={{ color: "rgba(226,232,240,0.72)", fontSize: 13, mt: 0.75 }}
                              >
                                {trial.competitionName || `Compétition ${trial.competitionId}`}{" "}
                                {trial.roundName || trial.categoryGender ? "· " : ""}
                                {getRoundLabel(trial.roundName || "Round")}{" "}
                                {trial.categoryGender
                                  ? `· ${getGenderLabel(trial.categoryGender)}`
                                  : ""}
                              </Typography>
                              {(trial.startDate && trial.startHour) || (trial.endDate && trial.endHour) ? (
                                <Typography
                                  sx={{ color: "rgba(226,232,240,0.62)", fontSize: 12, mt: 0.35 }}
                                >
                                  {formatScheduleLine(
                                    trial.startDate,
                                    trial.startHour,
                                    trial.endDate,
                                    trial.endHour
                                  ) || ""}
                                </Typography>
                              ) : null}
                            </Box>

                            <Stack spacing={0.8} sx={{ width: "100%" }}>
                              {[0, 1, 2].map((idx) => {
                                const result = topResults[idx];
                                if (!result) {
                                  return (
                                    <Box
                                      key={`placeholder-${idx}`}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        p: 1,
                                        borderRadius: 2,
                                        background: "transparent",
                                        minHeight: 44,
                                        height: 44,
                                        opacity: 0,
                                      }}
                                    >
                                      <Typography>-</Typography>
                                    </Box>
                                  );
                                }
                                return (
                                <Box
                                  key={result.id}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    p: 1,
                                    borderRadius: 2,
                                    background: "rgba(15, 23, 42, 0.35)",
                                    minHeight: 44,
                                    height: 44,
                                  }}
                                >
                                  <Typography sx={{ color: "#E2E8F0", fontWeight: 800 }}>
                                    {result.rank === 1
                                      ? "🥇"
                                      : result.rank === 2
                                        ? "🥈"
                                        : result.rank === 3
                                          ? "🥉"
                                          : result.rank}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#E2E8F0",
                                      flex: 1,
                                      fontWeight: 700,
                                      fontSize: 13,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {result?.participant?.displayName || "Participant"}
                                  </Typography>
                                  <Typography
                                    sx={{ color: "#67E8F9", fontWeight: 900, fontSize: 13 }}
                                  >
                                    {result.performance}
                                  </Typography>
                                </Box>
                                );
                              })}
                            </Stack>

                            <Typography
                              sx={{
                                color: "rgba(226,232,240,0.68)",
                                fontSize: 12,
                                mt: "auto",
                                pt: 0.5,
                              }}
                            >
                              {formatWhen(trial.latestUpdatedAt)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              p: { xs: 4, md: 6 },
              borderRadius: appTheme.radius.lg,
              background: appTheme.gradients.card,
              boxShadow: appTheme.shadows.card,
              border: "1px solid rgba(148, 163, 184, 0.1)",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                fontWeight: 800,
                mb: 2,
                color: appTheme.colors.textPrimary,
              }}
            >
              Prêt à commencer ?
            </Typography>
            <Typography
              sx={{
                fontSize: "1.125rem",
                color: appTheme.colors.textSecondary,
                mb: 4,
              }}
            >
              Rejoignez CiblOrgaSport dès aujourd'hui pour suivre vos compétitions préférées et ne rien manquer des résultats.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                onClick={() => navigate("/signup")}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: appTheme.gradients.navbar,
                  color: "#020617",
                  boxShadow: "0 10px 30px rgba(34, 211, 238, 0.3)",
                  "&:hover": {
                    background: appTheme.gradients.navbar,
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 40px rgba(34, 211, 238, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Créer un compte
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outlined"
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  border: `2px solid ${appTheme.colors.cyan}`,
                  color: appTheme.colors.cyan,
                  background: "transparent",
                  "&:hover": {
                    border: `2px solid ${appTheme.colors.cyan}`,
                    background: "rgba(34, 211, 238, 0.1)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Se connecter
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          px: 3,
          textAlign: "center",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            color: "#475569",
            fontSize: "0.875rem",
          }}
        >
          © 2025 CiblOrgaSport — Plateforme de gestion sportive
        </Typography>
      </Box>
    </Box>
  );
}
