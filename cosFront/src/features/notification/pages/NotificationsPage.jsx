import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";

import appTheme from "../../../common/theme/appTheme";
import notificationService from "../services/notificationService";

const NOTIFICATION_TYPE_LABELS = {
  INCIDENT: "Incident",
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

export default function NotificationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSpectatorRoute = location.pathname.startsWith("/spectator");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
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
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: "border-box",
      }
    : {
        p: { xs: 2, sm: 3, md: 4 },
        background: appTheme.gradients.page,
        minHeight: "100vh",
        boxSizing: "border-box",
      };

  const innerGlassSx = isSpectatorRoute
    ? {
        flex: 1,
        width: "100%",
        p: { xs: 2, sm: 2.5, md: 4 },
        background: "rgba(15, 23, 42, 0.42)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRadius: { xs: 2, md: 3 },
        boxShadow: "0 8px 32px rgba(2, 6, 23, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxSizing: "border-box",
      }
    : {
        maxWidth: 880,
        mx: "auto",
        width: "100%",
      };

  return (
    <Box sx={outerSx}>
      <Box sx={innerGlassSx}>
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
                background: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(167,139,250,0.2))",
                border: "1px solid rgba(34,211,238,0.35)",
                flexShrink: 0,
              }}
            >
              <NotificationsActiveIcon sx={{ color: appTheme.colors.cyan, fontSize: 26 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.35rem", sm: "1.5rem" },
                  color: isSpectatorRoute ? appTheme.colors.textPrimary : appTheme.colors.dark,
                  letterSpacing: "-0.02em",
                }}
              >
                Notifications
              </Typography>
              <Typography
                sx={{
                  color: isSpectatorRoute ? appTheme.colors.textMuted : appTheme.colors.textMuted,
                  fontSize: 14,
                  mt: 0.25,
                }}
              >
                {unreadCount === 0
                  ? "Aucune notification non lue"
                  : `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
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
              {isSpectatorRoute ? "Accueil spectateur" : "Retour"}
            </Button>
          </Stack>
        </Stack>

        {loadError && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              background: "rgba(127, 29, 29, 0.25)",
              color: "#fecaca",
              border: "1px solid rgba(248, 113, 113, 0.35)",
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
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: appTheme.colors.cyan }} />
          </Box>
        ) : sortedNotifications.length === 0 ? (
          <Box
            sx={{
              py: 6,
              px: 3,
              textAlign: "center",
              borderRadius: appTheme.radius.lg,
              background: isSpectatorRoute ? appTheme.gradients.card : "rgba(248,250,252,0.95)",
              border: isSpectatorRoute
                ? "1px solid rgba(148,163,184,0.2)"
                : "1px solid rgba(148,163,184,0.25)",
              boxShadow: isSpectatorRoute ? appTheme.shadows.card : undefined,
            }}
          >
            <NotificationsNoneIcon
              sx={{
                fontSize: 56,
                color: isSpectatorRoute ? appTheme.colors.textMuted : appTheme.colors.darkSoft,
                mb: 2,
                opacity: 0.85,
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: isSpectatorRoute ? appTheme.colors.textPrimary : appTheme.colors.dark,
                mb: 1,
              }}
            >
              Aucune notification
            </Typography>
            <Typography
              sx={{
                color: isSpectatorRoute ? appTheme.colors.textSecondary : appTheme.colors.textMuted,
                maxWidth: 400,
                mx: "auto",
                fontSize: 15,
                lineHeight: 1.5,
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
                    background: appTheme.gradients.card,
                    border: isRead
                      ? "1px solid rgba(148,163,184,0.18)"
                      : "1px solid rgba(34,211,238,0.45)",
                    boxShadow: isRead
                      ? "0 12px 28px rgba(2,6,23,0.28)"
                      : "0 12px 32px rgba(2,6,23,0.35), 0 0 0 1px rgba(34,211,238,0.12)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isRead
                        ? "0 16px 36px rgba(2,6,23,0.38)"
                        : "0 18px 40px rgba(2,6,23,0.42), 0 0 0 1px rgba(34,211,238,0.2)",
                    },
                    "&::before": isRead
                      ? undefined
                      : {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: `linear-gradient(180deg, ${appTheme.colors.cyan}, ${appTheme.colors.violet})`,
                          borderRadius: "4px 0 0 4px",
                        },
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
      </Box>
    </Box>
  );
}
