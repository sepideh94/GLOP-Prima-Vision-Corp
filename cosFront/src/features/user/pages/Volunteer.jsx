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
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";

import { useAuth } from "../../../common/contexts/AuthContext";
import authService from "../../../common/api/authService";
import notificationService from "../../notification/services/notificationService";

const HOME_IMAGES_VERSION = "20250324e";
const HERO_IMAGE = `${import.meta.env.BASE_URL}images/home/hero-natation.jpg?v=${HOME_IMAGES_VERSION}`;

const t = {
  page: "#F0F7FF",
  pageSoft: "#E8F3FC",
  inkHeading: "#0f2744",
  muted: "#5b6b7a",
  orange: "#ea580c",
  border: "rgba(15, 39, 68, 0.08)",
  red: "#dc2626",
};

function formatEmailGreeting(email) {
  if (!email || !email.includes("@")) return "Volontaire";
  const local = email.split("@")[0];
  const part = local.replace(/[._-]+/g, " ").trim();
  if (!part) return "Volontaire";
  return part
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
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
        cardBg: "linear-gradient(145deg, #ffffff 0%, #dbeafe 45%, #e0f2fe 120%)",
        iconBg: "linear-gradient(135deg, #0ea5e9, #0284c7)",
        iconColor: "#fff",
        accentBar: "#0284c7",
        borderGlow: "0 8px 28px rgba(14, 165, 233, 0.35)",
        hoverTint: "rgba(14, 165, 233, 0.1)",
      },
    },
    {
      title: "Mes notifications",
      subtitle:
        unreadNotifications > 0
          ? `${unreadNotifications} message${unreadNotifications > 1 ? "s" : ""} non lu${unreadNotifications > 1 ? "s" : ""}`
          : "Consignes et messages de l’organisation.",
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
      title: "Vos missions",
      body: (
        <>
          Ouvrez <strong>Mon planning</strong> pour voir le détail de chaque créneau : dates, lieu et description.
        </>
      ),
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 30 }} />,
      accent: "#0284c7",
      iconBg: "linear-gradient(135deg, #0ea5e9, #0284c7)",
      cardBg: "linear-gradient(145deg, #ffffff 0%, #dbeafe 50%, #e0f2fe 100%)",
      shadow: "0 10px 30px rgba(14, 165, 233, 0.22)",
    },
    {
      title: "Restez informé",
      body: (
        <>
          Les annulations ou changements d’horaire peuvent arriver : vérifiez régulièrement{" "}
          <strong>Mes notifications</strong>.
        </>
      ),
      icon: <CampaignOutlinedIcon sx={{ fontSize: 30 }} />,
      accent: "#16a34a",
      iconBg: "linear-gradient(135deg, #22c55e, #15803d)",
      cardBg: "linear-gradient(145deg, #ffffff 0%, #d1fae5 50%, #ecfdf5 100%)",
      shadow: "0 10px 30px rgba(34, 197, 94, 0.22)",
    },
    {
      title: "Conseil",
      body: (
        <>
          En cas de doute sur une mission, contactez l’organisation via les canaux indiqués dans vos messages.
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
        background: `linear-gradient(180deg, #ecfeff 0%, ${t.pageSoft} 40%, ${t.page} 100%)`,
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
          minHeight: { xs: 240, md: 280 },
          mb: 4,
          border: `1px solid ${t.border}`,
          boxShadow: "0 20px 50px rgba(15, 39, 68, 0.12)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center 42%",
            transform: "scale(1.06)",
            filter: "blur(5px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.5) 42%, rgba(6,182,212,0.28) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 70% at 20% 40%, rgba(45,212,191,0.2) 0%, transparent 55%)",
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
              icon={<VolunteerActivismOutlinedIcon sx={{ color: "#a5f3fc !important" }} />}
              label="Espace volontaire"
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
              label="Engagement · événements"
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: "rgba(6,182,212,0.28)",
                color: "#cffafe",
                border: "1px solid rgba(6,182,212,0.45)",
              }}
            />
          </Stack>

          {profileLoading ? (
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
              <CircularProgress size={22} sx={{ color: "#a5f3fc" }} />
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
              Merci pour votre engagement. Retrouvez ici un accès rapide à votre planning de missions et aux
              notifications de l’équipe d’organisation.
            </Typography>
          </Box>
        </Box>
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
                        <Typography sx={{ mt: 0.75, fontSize: "0.9rem", color: t.muted, lineHeight: 1.55 }}>
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
