import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

import { useAuth } from "../../../common/contexts/AuthContext";
import authService from "../../../common/api/authService";
import notificationService from "../../notification/services/notificationService";
import appTheme from "../../../common/theme/appTheme";

const HOME_IMAGES_VERSION = "20250324e";
const HERO_IMAGE = `${import.meta.env.BASE_URL}images/home/hero-natation.jpg?v=${HOME_IMAGES_VERSION}`;

const t = {
  page: "#F0F7FF",
  pageSoft: "#E8F3FC",
  ink: "#0c1a2e",
  inkHeading: "#0f2744",
  muted: "#5b6b7a",
  link: "#0284c7",
  border: "rgba(15, 39, 68, 0.08)",
  blue: "#2563eb",
  cyan: "#0891b2",
  green: "#16a34a",
  red: "#dc2626",
};

const cardBodyText = "rgba(12, 26, 46, 0.92)";
const cardTitleText = "#071422";
const cardChromeBorder = "rgba(15, 39, 68, 0.16)";
const cardAccentBarWidth = 7;
const cardMotion = "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease";

function formatEmailGreeting(email) {
  if (!email?.includes("@")) return "Volontaire";
  const local = email.split("@")[0];
  const part = local.replaceAll(/[._-]+/g, " ").trim();
  if (!part) return "Volontaire";
  return part
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatUnreadNotificationsLabel(unreadCount) {
  if (unreadCount <= 0) {
    return "Consignes et messages de l’organisation.";
  }
  const plural = unreadCount > 1 ? "s" : "";
  return `${unreadCount} message${plural} non lu${plural}`;
}

export default function Volunteer() {
  const navigate = useNavigate();
  const { user, login, token } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const me = await authService.getCurrentUser();
        if (cancelled) return;
        const fn = me?.firstName?.trim();
        const ln = me?.lastName?.trim();
        if (fn || ln) {
          const full = [fn, ln].filter(Boolean).join(" ");
          setDisplayName(full);
          const ufn = (user?.firstName || "").trim();
          const uln = (user?.lastName || "").trim();
          if (token && user && (fn !== ufn || ln !== uln)) {
            login({
              token,
              user: {
                ...user,
                firstName: fn || user.firstName,
                lastName: ln || user.lastName,
              },
            });
          }
        } else {
          setDisplayName(formatEmailGreeting(user?.email));
        }
      } catch {
        if (!cancelled) {
          const fn = user?.firstName?.trim();
          const ln = user?.lastName?.trim();
          if (fn || ln) setDisplayName([fn, ln].filter(Boolean).join(" "));
          else setDisplayName(formatEmailGreeting(user?.email));
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    loadProfile();

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
  }, [user?.email, token]);

  const navCards = [
    {
      title: "Mon planning",
      subtitle: "Vos missions, horaires et lieux d’affectation.",
      icon: <ScheduleOutlinedIcon sx={{ fontSize: 32 }} />,
      path: "/volunteer/planning",
      palette: {
        cardBg:
          "linear-gradient(135deg, #ffffff 0%, #bfdbfe 36%, #93c5fd 62%, #dbeafe 88%, #e0f2fe 115%)",
        iconBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        iconColor: "#fff",
        accentBar: "#2563eb",
        borderGlow: "0 8px 26px rgba(37, 99, 235, 0.22)",
        hoverTint: "rgba(37, 99, 235, 0.1)",
        ctaColor: "#1d4ed8",
        ctaHover: "#1e3a8a",
      },
    },
    {
      title: "Mes notifications",
      subtitle: formatUnreadNotificationsLabel(unreadNotifications),
      icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 30 }} />,
      path: "/notifications",
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      palette: {
        cardBg:
          "linear-gradient(135deg, #ffffff 0%, #cffafe 32%, #a5f3fc 55%, #e0f7fa 82%, #ecfeff 100%)",
        iconBg: "linear-gradient(135deg, #06b6d4, #0891b2)",
        iconColor: "#fff",
        accentBar: "#0891b2",
        borderGlow: "0 8px 26px rgba(8, 145, 178, 0.26)",
        hoverTint: "rgba(34, 211, 238, 0.14)",
        ctaColor: "#0e7490",
        ctaHover: "#0f766e",
      },
    },
    {
      title: "Mon profil",
      subtitle: "Documents et informations personnelles à jour.",
      icon: <VolunteerActivismOutlinedIcon sx={{ fontSize: 30 }} />,
      path: "/volunteer/profile",
      palette: {
        cardBg:
          "linear-gradient(135deg, #ffffff 0%, #6ee7b7 32%, #34d399 58%, #d1fae5 82%, #f0fdf4 100%)",
        iconBg: "linear-gradient(135deg, #16a34a, #15803d)",
        iconColor: "#fff",
        accentBar: "#15803d",
        borderGlow: "0 8px 26px rgba(22, 163, 74, 0.24)",
        hoverTint: "rgba(22, 163, 74, 0.12)",
        ctaColor: "#15803d",
        ctaHover: "#14532d",
      },
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "100%",
        fontFamily: appTheme.typography.fontFamily,
        background: `linear-gradient(180deg, #fffefb 0%, ${t.pageSoft} 38%, ${t.page} 100%)`,
        pb: { xs: 5, md: 7 },
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 2.5, md: 3 },
        pt: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          borderRadius: { xs: 3, md: 4 },
          overflow: "hidden",
          minHeight: { xs: 280, md: 320 },
          mb: { xs: 3, md: 4 },
          border: `1px solid ${t.border}`,
          boxShadow: "0 8px 32px rgba(15, 39, 68, 0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
          bgcolor: "#fff",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center 36%",
            transform: "scale(1.04)",
            filter: "blur(4px)",
            opacity: 0.28,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 12% 20%, rgba(250,204,21,0.12) 0%, transparent 55%), linear-gradient(165deg, rgba(255,255,255,0.97) 0%, rgba(240,247,255,0.94) 45%, rgba(224,242,254,0.88) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(37,99,235,0.06) 0%, transparent 42%, rgba(2,132,199,0.05) 100%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            p: { xs: 2.75, sm: 3.5, md: 4.5 },
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip
              icon={<VolunteerActivismOutlinedIcon sx={{ color: "#a5f3fc !important" }} />}
              label="Espace volontaire"
              size="small"
              sx={{
                fontWeight: 800,
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                color: t.inkHeading,
                border: "1px solid rgba(37, 99, 235, 0.2)",
              }}
            />
          </Stack>

          {profileLoading ? (
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
              <CircularProgress size={24} sx={{ color: t.blue }} />
              <Typography sx={{ color: t.muted, fontWeight: 600 }}>Chargement…</Typography>
            </Stack>
          ) : (
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.9rem", sm: "2.1rem", md: "2.45rem" },
                fontWeight: 900,
                color: t.inkHeading,
                letterSpacing: "-0.03em",
                lineHeight: 1.18,
                mb: 1.25,
              }}
            >
              Bienvenue{displayName ? `, ${displayName}` : ""}
            </Typography>
          )}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, md: 2.75 },
              borderRadius: 3,
              maxWidth: 680,
              border: `1px solid ${t.border}`,
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 4px 20px rgba(15, 39, 68, 0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.98rem", md: "1.02rem" },
                color: t.ink,
                lineHeight: 1.75,
                fontWeight: 500,
              }}
            >
              Merci pour votre engagement. Retrouvez ici un accès rapide à votre planning de missions et aux
              notifications de l’équipe d’organisation.
            </Typography>
          </Paper>
        </Box>
      </Paper>

      <Box sx={{ width: "100%", maxWidth: "100%" }}>
        <Box sx={{ minWidth: 0, width: "100%", maxWidth: { md: 720 }, mx: { md: "auto" } }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "0.72rem",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: t.link,
              mb: 0.5,
            }}
          >
            Navigation
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.2rem", md: "1.3rem" },
              color: t.inkHeading,
              mb: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Accès rapide
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: t.muted, lineHeight: 1.55, mb: 2, maxWidth: 480 }}>
            Ouvrez une section pour gérer vos missions, votre profil ou vos messages.
          </Typography>
          <Divider sx={{ mb: 2.5, borderColor: t.border }} />
          <Stack spacing={2.25} sx={{ width: "100%" }}>
            {navCards.map((c) => {
              const pal = c.palette;
              return (
                <Card
                  key={c.path}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${cardChromeBorder}`,
                    borderLeft: `${cardAccentBarWidth}px solid ${pal.accentBar}`,
                    backgroundColor: "#ffffff",
                    backgroundImage: pal.cardBg,
                    boxShadow: `${pal.borderGlow}, 0 1px 0 rgba(255,255,255,0.65) inset`,
                    overflow: "hidden",
                    width: "100%",
                    transition: cardMotion,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `${pal.borderGlow}, 0 14px 36px rgba(15, 39, 68, 0.14)`,
                      borderColor: "rgba(15, 39, 68, 0.22)",
                    },
                    "&:focus-within": {
                      boxShadow: `${pal.borderGlow}, 0 0 0 2px rgba(37, 99, 235, 0.45)`,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(c.path)}
                    sx={{
                      alignItems: "stretch",
                      borderRadius: 0,
                      p: 0,
                      transition: "background-color 0.2s ease",
                      "&:hover": { backgroundColor: pal.hoverTint },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 2.25, md: 2.75 },
                        display: "flex",
                        gap: { xs: 1.75, md: 2.25 },
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 52, sm: 56 },
                          height: { xs: 52, sm: 56 },
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: pal.iconColor,
                          background: pal.iconBg,
                          boxShadow: "0 6px 18px rgba(15, 39, 68, 0.2), 0 0 0 1px rgba(255,255,255,0.2) inset",
                        }}
                      >
                        {c.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography
                            component="h3"
                            sx={{
                              fontWeight: 900,
                              fontSize: { xs: "1.02rem", sm: "1.08rem" },
                              color: cardTitleText,
                              letterSpacing: "-0.02em",
                            }}
                          >
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
                          sx={{
                            mt: 0.85,
                            fontSize: "0.92rem",
                            color: cardBodyText,
                            fontWeight: 600,
                            lineHeight: 1.62,
                          }}
                        >
                          {c.subtitle}
                        </Typography>
                        <Button
                          tabIndex={-1}
                          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 11 }} />}
                          sx={{
                            mt: 2,
                            textTransform: "none",
                            fontWeight: 800,
                            color: pal.ctaColor,
                            p: 0,
                            minWidth: 0,
                            fontSize: "0.95rem",
                            "&:hover": {
                              backgroundColor: "transparent",
                              color: pal.ctaHover,
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
      </Box>
    </Box>
  );
}
