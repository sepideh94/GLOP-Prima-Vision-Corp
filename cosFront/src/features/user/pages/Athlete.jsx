import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Typography,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import StopIcon from "@mui/icons-material/Stop";
import SensorsIcon from "@mui/icons-material/Sensors";

import { useAuth } from "../../../common/contexts/AuthContext";
import athleteProfileService from "../../athlete/services/athleteProfileService";
import notificationService from "../../notification/services/notificationService";
import useAthleteTracking from "../../map/hooks/useAthleteTracking";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=2000&q=78";

const t = {
  page: "#F0F7FF",
  pageSoft: "#E8F3FC",
  ink: "#0c1a2e",
  inkHeading: "#0f2744",
  muted: "#5b6b7a",
  link: "#0284c7",
  linkHover: "#0369a1",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#16a34a",
  orange: "#ea580c",
  amber: "#ca8a04",
  border: "rgba(15, 39, 68, 0.08)",
};

function formatEmailGreeting(email) {
  if (!email || !email.includes("@")) return "Athlète";
  const local = email.split("@")[0];
  const part = local.replace(/[._-]+/g, " ").trim();
  if (!part) return "Athlète";
  return part
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function Athlete() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { tracking, error, startTracking, stopTracking } = useAthleteTracking(user?.id);

  const handleConfirmStart = () => {
    setConfirmOpen(false);
    startTracking();
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setProfileLoading(true);
      try {
        const profile = await athleteProfileService.getMyProfile();
        if (cancelled) return;
        const fn = profile?.firstName?.trim();
        const ln = profile?.lastName?.trim();
        if (fn || ln) {
          setDisplayName([fn, ln].filter(Boolean).join(" "));
        } else {
          setDisplayName(formatEmailGreeting(user?.email));
        }
      } catch {
        if (!cancelled) {
          setDisplayName(formatEmailGreeting(user?.email));
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    load();

    const loadUnread = async () => {
      try {
        const n = await notificationService.getUnreadCount();
        if (!cancelled && typeof n === "number") setUnreadNotifications(n);
      } catch {
        /* ignore */
      }
    };
    loadUnread();

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const navCards = [
    {
      title: "Mes compétitions",
      subtitle:
        "Participations, validations et accès au planning une fois confirmé.",
      icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 32 }} />,
      path: "/athlete/competitions",
      palette: {
        cardBg: "linear-gradient(145deg, #ffffff 0%, #dbeafe 45%, #fef08a 120%)",
        iconBg: "linear-gradient(135deg, #3b82f6, #2563eb)",
        iconColor: "#fff",
        accentBar: "#f59e0b",
        borderGlow: "0 8px 28px rgba(245, 158, 11, 0.35)",
        hoverTint: "rgba(59, 130, 246, 0.08)",
      },
    },
    {
      title: "Mon profil",
      subtitle: "Documents officiels, charte et identité à jour.",
      icon: <PersonOutlineIcon sx={{ fontSize: 30 }} />,
      path: "/athlete/profile",
      palette: {
        cardBg: "linear-gradient(145deg, #ffffff 0%, #d1fae5 50%, #fff 100%)",
        iconBg: "linear-gradient(135deg, #22c55e, #16a34a)",
        iconColor: "#fff",
        accentBar: "#16a34a",
        borderGlow: "0 8px 28px rgba(34, 197, 94, 0.3)",
        hoverTint: "rgba(34, 197, 94, 0.1)",
      },
    },
    {
      title: "Mes notifications",
      subtitle:
        unreadNotifications > 0
          ? `${unreadNotifications} message${unreadNotifications > 1 ? "s" : ""} non lu${unreadNotifications > 1 ? "s" : ""}`
          : "Alertes du commissaire et de l’organisation.",
      icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 30 }} />,
      path: "/notifications",
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      palette: {
        cardBg: "linear-gradient(145deg, #ffffff 0%, #ffedd5 40%, #fde047 115%)",
        iconBg: "linear-gradient(135deg, #f97316, #ea580c)",
        iconColor: "#fff",
        accentBar: "#ea580c",
        borderGlow: "0 8px 28px rgba(234, 88, 12, 0.35)",
        hoverTint: "rgba(249, 115, 22, 0.1)",
      },
    },
  ];

  const tipCards = [
    {
      title: "Votre planning",
      body: (
        <>
          Une fois votre participation <strong>confirmée</strong>, ouvrez <strong>Mes compétitions</strong> puis{" "}
          <strong>Voir le planning</strong>.
        </>
      ),
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 30 }} />,
      accent: "#0284c7",
      iconBg: "linear-gradient(135deg, #0ea5e9, #0284c7)",
      cardBg: "linear-gradient(145deg, #ffffff 0%, #dbeafe 50%, #e0f2fe 100%)",
      shadow: "0 10px 30px rgba(14, 165, 233, 0.22)",
    },
    {
      title: "Dossier & charte",
      body: (
        <>
          Passeport, certificat médical et charte requis. En équipe, le planning s’ouvre quand{" "}
          <strong>toute l’équipe</strong> est validée.
        </>
      ),
      icon: <VerifiedOutlinedIcon sx={{ fontSize: 30 }} />,
      accent: "#16a34a",
      iconBg: "linear-gradient(135deg, #22c55e, #15803d)",
      cardBg: "linear-gradient(145deg, #ffffff 0%, #d1fae5 50%, #ecfdf5 100%)",
      shadow: "0 10px 30px rgba(34, 197, 94, 0.22)",
    },
    {
      title: "Conseil",
      body: (
        <>
          Consultez <strong>Mes notifications</strong> : retours sur vos documents et confirmations.
        </>
      ),
      icon: <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 30 }} />,
      accent: "#ea580c",
      iconBg: "linear-gradient(135deg, #f97316, #c2410c)",
      cardBg: "linear-gradient(145deg, #ffffff 0%, #ffedd5 45%, #fff7ed 100%)",
      shadow: "0 10px 30px rgba(249, 115, 22, 0.22)",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "100%",
        background: `linear-gradient(180deg, #fffbeb 0%, ${t.pageSoft} 40%, ${t.page} 100%)`,
        pb: 6,
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 2.5, md: 3 },
        pt: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: { xs: 3, md: 4 },
          overflow: "hidden",
          minHeight: { xs: 260, md: 300 },
          mb: 4,
          border: `1px solid ${t.border}`,
          boxShadow: "0 20px 50px rgba(15, 39, 68, 0.12)",
        }}
      >
        {/* Photo floutée (lisibilité du texte sur le devant) */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center 36%",
            transform: "scale(1.06)",
            filter: "blur(5px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(15,23,42,0.78) 0%, rgba(15,23,42,0.45) 42%, rgba(2,132,199,0.25) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 70% at 20% 40%, rgba(250,204,21,0.18) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            p: { xs: 3, md: 4.5 },
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip
              icon={<BoltOutlinedIcon sx={{ color: "#fef08a !important" }} />}
              label="Espace athlète"
              size="small"
              sx={{
                fontWeight: 800,
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                backdropFilter: "blur(8px)",
              }}
            />
            <Chip
              label="Performance · fair-play"
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: "rgba(34,197,94,0.25)",
                color: "#bbf7d0",
                border: "1px solid rgba(34,197,94,0.4)",
              }}
            />
          </Stack>

          {profileLoading ? (
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
              <CircularProgress size={22} sx={{ color: "#fef08a" }} />
              <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>Chargement…</Typography>
            </Stack>
          ) : (
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.85rem", md: "2.35rem" },
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                mb: 1.5,
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
              }}
            >
              Bienvenue{displayName ? `, ${displayName}` : ""}
            </Typography>
          )}

          <Box
            sx={{
              p: 2.25,
              borderRadius: 3,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.28)",
              backdropFilter: "blur(14px)",
              maxWidth: 620,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.98rem", md: "1.05rem" },
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1.7,
                fontWeight: 500,
                textShadow: "0 1px 8px rgba(0,0,0,0.25)",
              }}
            >
              Retrouvez ici l’essentiel pour vos compétitions : inscriptions, validation de vos documents
              par le commissaire, puis votre planning d’épreuves dès que votre participation est confirmée.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${t.border}`,
          background: "#fff",
          boxShadow: "0 8px 24px rgba(15, 39, 68, 0.08)",
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: t.inkHeading, mb: 2 }}>
          Suivi de position
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: error ? 1 : 0 }}>
          {tracking ? (
            <>
              <Chip icon={<SensorsIcon />} label="Suivi de position actif" color="success" />
              <Button variant="outlined" color="error" startIcon={<StopIcon />} onClick={stopTracking}>
                Arrêter le suivi
              </Button>
            </>
          ) : (
            <Button variant="contained" startIcon={<MyLocationIcon />} onClick={() => setConfirmOpen(true)}>
              Activer le suivi de position
            </Button>
          )}
        </Box>
        {error && (
          <Alert severity="warning" sx={{ maxWidth: 480 }}>
            {error}
          </Alert>
        )}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle fontWeight={700}>Activer le suivi de position ?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              En activant le suivi, votre position GPS sera envoyée à nos serveurs toutes les 30 secondes.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les organisateurs et les spectateurs pourront voir votre position en temps réel sur la carte pendant la
              compétition.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleConfirmStart} startIcon={<MyLocationIcon />}>
              Activer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.2fr) minmax(0, 1fr)" },
          gap: { xs: 3, md: 3.5 },
          alignItems: "stretch",
        }}
      >
        <Box sx={{ minWidth: 0, width: "100%" }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "1.2rem",
                color: t.inkHeading,
                mb: 2,
                letterSpacing: "-0.02em",
              }}
            >
              Accès rapide
            </Typography>
            <Stack spacing={2} sx={{ width: "100%" }}>
              {navCards.map((c) => {
                const pal = c.palette;
                return (
                  <Card
                    key={c.path}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid rgba(15, 39, 68, 0.1)`,
                      borderLeft: `6px solid ${pal.accentBar}`,
                      background: pal.cardBg,
                      boxShadow: pal.borderGlow,
                      overflow: "visible",
                      width: "100%",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: `${pal.borderGlow}, 0 16px 40px rgba(15, 39, 68, 0.12)`,
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(c.path)}
                      sx={{
                        alignItems: "stretch",
                        borderRadius: 3,
                        p: 0,
                        "&:hover": { backgroundColor: pal.hoverTint },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: { xs: 2.25, md: 2.5 },
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: pal.iconColor,
                            background: pal.iconBg,
                            boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                          }}
                        >
                          {c.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography sx={{ fontWeight: 900, fontSize: "1.05rem", color: t.inkHeading }}>
                              {c.title}
                            </Typography>
                            {c.badge != null && (
                              <Chip
                                label={c.badge}
                                size="small"
                                sx={{
                                  height: 22,
                                  minWidth: 22,
                                  fontWeight: 800,
                                  backgroundColor: t.red,
                                  color: "#fff",
                                  "& .MuiChip-label": { px: 1 },
                                }}
                              />
                            )}
                          </Stack>
                          <Typography
                            sx={{ mt: 0.75, fontSize: "0.9rem", color: t.muted, lineHeight: 1.55 }}
                          >
                            {c.subtitle}
                          </Typography>
                          <Button
                            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 11 }} />}
                            sx={{
                              mt: 2,
                              textTransform: "none",
                              fontWeight: 800,
                              color: t.orange,
                              p: 0,
                              minWidth: 0,
                              fontSize: "0.95rem",
                              "&:hover": {
                                backgroundColor: "transparent",
                                color: "#c2410c",
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Ouvrir
                          </Button>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Stack>
        </Box>

        <Box sx={{ minWidth: 0, width: "100%" }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "1.2rem",
                color: t.inkHeading,
                mb: 2,
                letterSpacing: "-0.02em",
              }}
            >
              Bon à savoir
            </Typography>
            <Stack spacing={2} sx={{ width: "100%" }}>
              {tipCards.map((tip) => (
                <Card
                  key={tip.title}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid rgba(15, 39, 68, 0.1)`,
                    borderLeft: `6px solid ${tip.accent}`,
                    background: tip.cardBg,
                    boxShadow: tip.shadow,
                    overflow: "visible",
                    width: "100%",
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 2.25, md: 2.5 },
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                      "&:last-child": { pb: { xs: 2.25, md: 2.5 } },
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "#fff",
                        background: tip.iconBg,
                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      }}
                    >
                      {tip.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: "1.05rem", color: t.inkHeading }}>
                        {tip.title}
                      </Typography>
                      <Typography sx={{ mt: 0.75, fontSize: "0.9rem", color: t.muted, lineHeight: 1.65 }}>
                        {tip.body}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
        </Box>
      </Box>
    </Box>
  );
}
