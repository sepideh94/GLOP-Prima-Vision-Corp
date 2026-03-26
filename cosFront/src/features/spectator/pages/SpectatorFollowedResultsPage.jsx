import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PlaceIcon from "@mui/icons-material/Place";
import appTheme from "../../../common/theme/appTheme";
import spectatorProfileService from "../services/spectatorProfileService";
import spectatorService from "../services/spectatorService";
import {
  competitionStatusColor,
  competitionStatusLabel,
} from "../utils/competitionStatus";
import CompetitionSwimImage from "../components/CompetitionSwimImage";

const pageInk = "#0f2744";
const pageMuted = "#475569";
const pageBorder = "rgba(15, 39, 68, 0.1)";

export default function SpectatorFollowedResultsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  const ids = useMemo(() => {
    const raw = spectatorProfileService.getCompetitionFavorites();
    return [...new Set(raw.map((id) => String(id)))];
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (ids.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const list = await Promise.all(
          ids.map(async (id) => {
            const c = await spectatorService.getCompetitionById(id);
            return {
              id,
              competition: c,
            };
          })
        );
        if (!cancelled) setRows(list);
      } catch (e) {
        if (!cancelled) setError("Impossible de charger vos compétitions suivies.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        fontFamily: appTheme.typography.fontFamily,
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: "auto", py: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 }, pb: 5 }}>
        <Button
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate("/spectator")}
          sx={{
            mb: 2,
            textTransform: "none",
            fontWeight: 700,
            color: "#0e7490",
            "&:hover": { bgcolor: "rgba(8,145,178,0.08)" },
          }}
        >
          Retour à l’accueil fan
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${pageBorder}`,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.45) 50%, rgba(236,253,245,0.35) 100%)",
            boxShadow: "0 8px 32px rgba(15, 39, 68, 0.07)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <LeaderboardIcon sx={{ fontSize: 32, color: "#0e7490" }} />
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.5rem", sm: "1.85rem" },
                  color: pageInk,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Résultats & classements
              </Typography>
              <Typography sx={{ mt: 0.75, color: pageMuted, fontWeight: 600, fontSize: 15, lineHeight: 1.5 }}>
                Accès direct aux épreuves, résultats et classements des compétitions que vous suivez.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#0891b2" }} />
          </Box>
        ) : ids.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: `1px solid ${pageBorder}`,
              bgcolor: "rgba(255,255,255,0.96)",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: pageInk, fontWeight: 700, mb: 1 }}>
              Aucune compétition suivie pour l’instant
            </Typography>
            <Typography sx={{ color: pageMuted, mb: 2, maxWidth: 480, mx: "auto" }}>
              Activez « Suivre » sur une carte compétition depuis l’accueil ou la fiche événement : elle apparaîtra
              ici.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/spectator")}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                backgroundImage: appTheme.gradients.navbar,
                color: appTheme.colors.dark,
              }}
            >
              Parcourir les compétitions
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {rows.map(({ id, competition }) => {
              const st = competition
                ? competitionStatusColor(competition.status)
                : appTheme.colors.textMuted;
              const name = competition?.name || `Compétition ${id}`;
              const eventName = competition?.parentEventName || competition?.eventName;
              return (
                <Card
                  key={id}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${pageBorder}`,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(15, 39, 68, 0.06)",
                    borderLeft: `6px solid ${st}`,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
                    <Box sx={{ width: { xs: "100%", sm: 200 }, flexShrink: 0 }}>
                      <CardActionArea
                        onClick={() => navigate(`/spectator/competitions/${id}`)}
                        sx={{ height: { xs: 140, sm: "100%" }, p: 0 }}
                      >
                        <CompetitionSwimImage competitionId={id} height={160} />
                      </CardActionArea>
                    </Box>
                    <CardContent
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        py: 2.5,
                        pr: { xs: 2, sm: 3 },
                      }}
                    >
                      <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Chip
                          icon={<EmojiEventsIcon sx={{ fontSize: 18 }} />}
                          label="Natation"
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: "rgba(8,145,178,0.1)", color: "#0e7490" }}
                        />
                        {competition && (
                          <Chip
                            label={competitionStatusLabel(
                              competition.status,
                              competition.statusLabel
                            )}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: `${st}18`,
                              color: st,
                              border: `1px solid ${st}44`,
                            }}
                          />
                        )}
                        {!competition && (
                          <Chip label="Détails limités" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                        )}
                      </Stack>
                      <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: pageInk, mb: 0.75 }}>
                        {name}
                      </Typography>
                      {eventName && (
                        <Stack direction="row" alignItems="flex-start" spacing={0.5} sx={{ mb: 2 }}>
                          <PlaceIcon sx={{ fontSize: 18, color: pageMuted, mt: 0.1 }} />
                          <Typography sx={{ color: pageMuted, fontSize: 14, fontWeight: 600 }}>{eventName}</Typography>
                        </Stack>
                      )}
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        <Button
                          variant="contained"
                          startIcon={<LeaderboardIcon />}
                          onClick={() => navigate(`/spectator/competitions/${id}`)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            backgroundImage: appTheme.gradients.navbar,
                            color: appTheme.colors.dark,
                            border: "1px solid rgba(15,23,42,0.06)",
                          }}
                        >
                          Résultats & classement
                        </Button>
                      </Stack>
                    </CardContent>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
