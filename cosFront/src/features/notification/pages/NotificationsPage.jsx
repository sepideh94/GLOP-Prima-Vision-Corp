import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Snackbar,
  Alert as MuiAlert,
  Paper,
  Stack,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import GroupsIcon from "@mui/icons-material/Groups";

import notificationService from "../services/notificationService";
import { SPECTATOR_MENU_GLASS_DECOR } from "../../spectator/swimmingVisuals";
import {
  spectatorGlassTint,
  textLegibleDark,
  spectatorDarkMenuShell,
} from "../../spectator/spectatorGlassTheme";
import appTheme from "../../../common/theme/appTheme";

const NOTIFICATION_TYPE_LABELS = {
  INCIDENT: "Incident",
  TEAM_PARTICIPATION_VALIDATED: "Équipe",
  PARTICIPATION_VALIDATED: "Validation",
  PARTICIPATION_REFUSED: "Refus",
};

function notificationTypeLabel(type) {
  if (!type) return null;
  const key = String(type).toUpperCase();
  return NOTIFICATION_TYPE_LABELS[key] || String(type);
}

function parseNotificationLink(link, origin) {
  if (!link) return { kind: "none" };
  const trimmed = String(link).trim();
  if (!trimmed) return { kind: "none" };
  try {
    if (trimmed.startsWith("/")) {
      return { kind: "internal", path: trimmed };
    }
    const u = new URL(trimmed, origin || "http://localhost");
    const o = origin || (typeof window !== "undefined" ? window.location.origin : "");
    if (o && u.origin === o) {
      return { kind: "internal", path: `${u.pathname}${u.search}${u.hash}` };
    }
    return { kind: "external", href: u.href };
  } catch {
    return { kind: "none" };
  }
}

function formatSentAt(sentAt) {
  if (!sentAt) return { full: "—", relative: "" };
  const d = new Date(sentAt);
  if (Number.isNaN(d.getTime())) return { full: String(sentAt), relative: "" };
  return {
    full: format(d, "d MMM yyyy · HH:mm", { locale: fr }),
    relative: formatDistanceToNow(d, { addSuffix: true, locale: fr }),
  };
}

function formatDateTime(sentAt) {
  if (!sentAt) return "—";
  const d = new Date(sentAt);
  if (Number.isNaN(d.getTime())) return String(sentAt);
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(sentAt) {
  if (!sentAt) return "";
  const d = new Date(sentAt);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l’instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Il y a ${days} j`;
  return "";
}

const TYPE_STYLE = {
  TEAM_PARTICIPATION_VALIDATED: {
    bg: "linear-gradient(135deg, #bfdbfe, #93c5fd)",
    fg: "#1e3a8a",
    icon: <GroupsIcon sx={{ fontSize: 20 }} />,
  },
  PARTICIPATION_VALIDATED: {
    bg: "linear-gradient(135deg, #86efac, #4ade80)",
    fg: "#14532d",
    icon: null,
  },
  PARTICIPATION_REFUSED: {
    bg: "linear-gradient(135deg, #fdba74, #fb923c)",
    fg: "#7c2d12",
    icon: null,
  },
  default: {
    bg: "linear-gradient(135deg, #fde047, #facc15)",
    fg: "#713f12",
    icon: null,
  },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSpectatorRoute = location.pathname.startsWith("/spectator");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const ad = a.sentAt ? new Date(a.sentAt).getTime() : 0;
      const bd = b.sentAt ? new Date(b.sentAt).getTime() : 0;
      return bd - ad;
    });
  }, [notifications]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [items, count] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(Array.isArray(items) ? items : []);
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch (e) {
      console.error("Erreur chargement notifications", e);
      setNotifications([]);
      setUnreadCount(0);
      setLoadError("Impossible de charger les notifications. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAsRead = async (rawId) => {
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      setSnackbar({ open: true, message: "Identifiant de notification invalide." });
      return;
    }
    setMarkingId(id);
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (Number(n.id) === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const goBackHome = () => {
    if (isSpectatorRoute) navigate("/spectator");
    else navigate("/");
  };

  const outerSx = isSpectatorRoute
    ? {
        flex: 1,
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        boxSizing: "border-box",
      }
    : {
        p: { xs: 2, sm: 3, md: 4 },
        background: appTheme.gradients.page,
        minHeight: "100vh",
        boxSizing: "border-box",
      };

  const innerNonSpectatorSx = {
    maxWidth: 880,
    mx: "auto",
    width: "100%",
  };

  const spectatorActionIconSx = {
    color: "#e2e8f0",
    bgcolor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: "999px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
    "&:hover": {
      bgcolor: "rgba(34,211,238,0.2)",
      borderColor: appTheme.colors.cyan,
      color: "#f8fafc",
    },
    "&.Mui-disabled": { color: "rgba(226,232,240,0.4)", borderColor: "rgba(255,255,255,0.12)" },
  };

  const pageContent = (
    <>
        {isSpectatorRoute ? (
          <>
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
                Notifications
              </Typography>
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
                {unreadCount === 0
                  ? "Aucune notification non lue"
                  : `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
              </Typography>
            </Box>

            <Box
              sx={{
                ...spectatorDarkMenuShell,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1.25,
                mb: 3,
                py: 1.5,
                px: { xs: 1.5, sm: 2 },
              }}
            >
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={load}
                  disabled={loading}
                  sx={spectatorActionIconSx}
                  aria-label="Actualiser la liste"
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 20 }} />}
                onClick={goBackHome}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: "999px",
                  px: 2,
                  py: 0.75,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: 13,
                  backgroundImage: "none",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.16)",
                    borderColor: "rgba(255,255,255,0.32)",
                  },
                }}
              >
                Accueil spectateur
              </Button>
            </Box>
          </>
        ) : (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(167,139,250,0.2))",
                  border: "1px solid rgba(34,211,238,0.35)",
                }}
              >
                <NotificationsActiveIcon sx={{ color: appTheme.colors.cyan, fontSize: 26 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "1.35rem", sm: "1.5rem" },
                    letterSpacing: "-0.02em",
                    color: appTheme.colors.dark,
                  }}
                >
                  Notifications
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    mt: 0.25,
                    color: appTheme.colors.textMuted,
                  }}
                >
                  {unreadCount === 0
                    ? "Aucune notification non lue"
                    : `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
                </Typography>
              </Box>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: "flex-start", sm: "flex-end" }}
            >
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={load}
                  disabled={loading}
                  sx={{
                    color: appTheme.colors.cyan,
                    border: "1px solid rgba(34,211,238,0.35)",
                    borderRadius: 2,
                    "&:hover": { background: "rgba(34,211,238,0.12)" },
                  }}
                  aria-label="Actualiser la liste"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={goBackHome}
                sx={{
                  color: appTheme.colors.cyan,
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: appTheme.radius.pill,
                  px: 2,
                  "&:hover": { background: "rgba(34,211,238,0.12)" },
                }}
              >
                Retour
              </Button>
            </Stack>
          </Stack>
        )}

        {loadError && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              ...(isSpectatorRoute
                ? {
                    background: "rgba(254, 226, 226, 0.95)",
                    color: "#991b1b",
                    border: "1px solid rgba(248, 113, 113, 0.45)",
                    "& .MuiAlert-icon": { color: "#b91c1c" },
                  }
                : {
                    background: "rgba(127, 29, 29, 0.25)",
                    color: "#fecaca",
                    border: "1px solid rgba(248, 113, 113, 0.35)",
                  }),
            }}
            action={
              <Button color="inherit" size="small" onClick={load} sx={{ fontWeight: 700 }}>
                Réessayer
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
              minHeight: 200,
            }}
          >
            <CircularProgress sx={{ color: appTheme.colors.cyan }} />
          </Box>
        ) : sortedNotifications.length === 0 ? (
          <Box
            sx={{
              py: 6,
              px: 3,
              textAlign: "center",
              borderRadius: appTheme.radius.lg,
              ...(isSpectatorRoute
                ? {
                    background:
                      "linear-gradient(145deg, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.48) 100%)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow:
                      "0 12px 40px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }
                : {
                    background: "rgba(248,250,252,0.95)",
                    border: "1px solid rgba(148,163,184,0.25)",
                  }),
            }}
          >
            <NotificationsNoneIcon
              sx={{
                fontSize: 56,
                color: isSpectatorRoute ? "rgba(148,163,184,0.95)" : appTheme.colors.darkSoft,
                mb: 2,
                opacity: 0.95,
              }}
            />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.1rem",
                mb: 1,
                ...(isSpectatorRoute
                  ? { color: "#f8fafc", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }
                  : { color: appTheme.colors.dark }),
              }}
            >
              Aucune notification
            </Typography>
            <Typography
              sx={{
                maxWidth: 400,
                mx: "auto",
                fontSize: 15,
                lineHeight: 1.55,
                ...(isSpectatorRoute
                  ? { color: "#d1d5db", fontWeight: 500 }
                  : { color: appTheme.colors.textMuted }),
              }}
            >
              Vous serez informé ici des alertes importantes (par ex. incidents signalés sur les
              compétitions que vous suivez).
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {sortedNotifications.map((n) => {
              const isRead = Boolean(n.isRead);
              const linkInfo = parseNotificationLink(n.link, origin);
              const { full, relative } = formatSentAt(n.sentAt);
              const typeLabel = notificationTypeLabel(n.type);

              return (
                <Box
                  key={n.id}
                  sx={{
                    position: "relative",
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: appTheme.radius.lg,
                    overflow: "hidden",
                    isolation: "isolate",
                    ...(isSpectatorRoute
                      ? {
                          background:
                            "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.72) 100%)",
                          backdropFilter: "blur(14px)",
                          WebkitBackdropFilter: "blur(14px)",
                          border: isRead
                            ? "1px solid rgba(255,255,255,0.12)"
                            : "1px solid rgba(34,211,238,0.35)",
                          borderLeft: isRead
                            ? "6px solid rgba(148,163,184,0.35)"
                            : `6px solid ${appTheme.colors.cyan}`,
                          boxShadow: isRead
                            ? "0 12px 36px rgba(2,6,23,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)"
                            : `0 12px 36px rgba(2,6,23,0.45), inset 0 0 0 1px rgba(34,211,238,0.15)`,
                        }
                      : {
                          background: appTheme.gradients.card,
                          border: isRead
                            ? "1px solid rgba(148,163,184,0.18)"
                            : "1px solid rgba(34,211,238,0.45)",
                          boxShadow: isRead
                            ? "0 12px 28px rgba(2,6,23,0.28)"
                            : "0 12px 32px rgba(2,6,23,0.35), 0 0 0 1px rgba(34,211,238,0.12)",
                        }),
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isSpectatorRoute
                        ? isRead
                          ? "0 16px 40px rgba(2,6,23,0.5)"
                          : `0 18px 44px rgba(2,6,23,0.5), 0 0 0 1px rgba(34,211,238,0.22)`
                        : isRead
                          ? "0 16px 36px rgba(2,6,23,0.38)"
                          : "0 18px 40px rgba(2,6,23,0.42), 0 0 0 1px rgba(34,211,238,0.2)",
                    },
                    ...(!isSpectatorRoute &&
                      !isRead && {
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: `linear-gradient(180deg, ${appTheme.colors.cyan}, ${appTheme.colors.violet})`,
                          borderRadius: "4px 0 0 4px",
                        },
                      }),
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", md: "flex-start" }}
                    justifyContent="space-between"
                    sx={{ pl: isRead ? 0 : { xs: 0, md: 0.5 } }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0, pl: isRead ? 0 : { xs: 0.5, sm: 0 } }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                        {!isRead && (
                          <Box
                            component="span"
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: appTheme.colors.cyan,
                              boxShadow: `0 0 10px ${appTheme.colors.cyan}`,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1rem", sm: "1.05rem" },
                            color: appTheme.colors.textPrimary,
                            lineHeight: 1.3,
                          }}
                        >
                          {n.title || "Notification"}
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          color: appTheme.colors.textSecondary,
                          mb: 1.5,
                          fontSize: 14,
                          lineHeight: 1.55,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {n.message || ""}
                      </Typography>

                      <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                        {n.incidentStatus && (
                          <Chip
                            size="small"
                            label={`Statut : ${n.incidentStatus}`}
                            sx={{
                              background: "rgba(167,139,250,0.2)",
                              color: "#e9d5ff",
                              fontWeight: 700,
                              border: "1px solid rgba(167,139,250,0.35)",
                            }}
                          />
                        )}
                        {typeLabel && (
                          <Chip
                            size="small"
                            label={typeLabel}
                            sx={{
                              background: "rgba(34,211,238,0.16)",
                              color: "#67e8f9",
                              fontWeight: 700,
                              border: "1px solid rgba(34,211,238,0.35)",
                            }}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Stack
                      spacing={1.5}
                      sx={{
                        minWidth: { md: 200 },
                        alignItems: { xs: "stretch", md: "flex-end" },
                        textAlign: { xs: "left", md: "right" },
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: appTheme.colors.textMuted,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {full}
                        </Typography>
                        {relative && (
                          <Typography sx={{ color: appTheme.colors.textMuted, fontSize: 11, opacity: 0.9 }}>
                            {relative}
                          </Typography>
                        )}
                      </Box>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        sx={{ width: { xs: "100%", md: "auto" } }}
                      >
                        {!isRead && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleMarkAsRead(n.id)}
                            sx={{
                              borderRadius: appTheme.radius.pill,
                              textTransform: "none",
                              fontWeight: 800,
                              background: "linear-gradient(135deg, #22D3EE, #06B6D4)",
                              color: "#0f172a",
                              boxShadow: "0 6px 16px rgba(34, 211, 238, 0.35)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #06B6D4, #0891B2)",
                              },
                            }}
                          >
                            Marquer comme lu
                          </Button>
                        )}

                        {linkInfo.kind === "internal" && (
                          <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
                            onClick={() => navigate(linkInfo.path)}
                            sx={{
                              borderColor: "rgba(34,211,238,0.55)",
                              color: "#a5f3fc",
                              borderRadius: appTheme.radius.pill,
                              textTransform: "none",
                              fontWeight: 800,
                              "&:hover": {
                                borderColor: appTheme.colors.cyan,
                                background: "rgba(34,211,238,0.08)",
                              },
                            }}
                          >
                            Voir
                          </Button>
                        )}

                        {linkInfo.kind === "external" && (
                          <Button
                            variant="outlined"
                            size="small"
                            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                            onClick={() =>
                              window.open(linkInfo.href, "_blank", "noopener,noreferrer")
                            }
                            sx={{
                              borderColor: "rgba(148,163,184,0.45)",
                              color: appTheme.colors.textSecondary,
                              borderRadius: appTheme.radius.pill,
                              textTransform: "none",
                              fontWeight: 800,
                              "&:hover": {
                                borderColor: appTheme.colors.cyan,
                                color: appTheme.colors.cyan,
                                background: "rgba(34,211,238,0.06)",
                              },
                            }}
                          >
                            Ouvrir le lien
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
    </>
  );

  return (
    <Box sx={outerSx}>
      {isSpectatorRoute ? (
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
              opacity: 0.42,
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
            {pageContent}
          </Box>
        </Box>
      ) : (
        <Box sx={innerNonSpectatorSx}>{pageContent}</Box>
      )}
    </Box>
  );
}
