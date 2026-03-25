import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Snackbar,
  Alert as MuiAlert,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GppBadOutlinedIcon from "@mui/icons-material/GppBadOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

import appTheme from "../../../common/theme/appTheme";
import { useNotificationUnread } from "../../../common/contexts/NotificationUnreadContext";
import notificationService from "../services/notificationService";

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

const NOTIFICATION_TYPE_LABELS = {
  TEAM_PARTICIPATION_VALIDATED: "Équipe",
  PARTICIPATION_VALIDATED: "Validation",
  PARTICIPATION_REFUSED: "Refus",
};

const TYPE_STYLE = {
  TEAM_PARTICIPATION_VALIDATED: {
    accent: "#2563eb",
    bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    fg: "#1e3a8a",
    icon: <GroupsIcon sx={{ fontSize: 22 }} />,
  },
  PARTICIPATION_VALIDATED: {
    accent: "#15803d",
    bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    fg: "#14532d",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />,
  },
  PARTICIPATION_REFUSED: {
    accent: "#be123c",
    bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
    fg: "#881337",
    icon: <GppBadOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  default: {
    accent: "#0891b2",
    bg: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
    fg: "#0e7490",
    icon: <MarkEmailReadOutlinedIcon sx={{ fontSize: 22 }} />,
  },
};

const ink = "#0c1a2e";
const inkHeading = "#0f2744";
const muted = "#475569";
const borderSubtle = "rgba(15, 39, 68, 0.08)";

export default function NotificationsPage() {
  const { syncUnreadCount, decrementUnreadCount } = useNotificationUnread();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [listFilter, setListFilter] = useState("all");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const ad = a.sentAt ? new Date(a.sentAt).getTime() : 0;
      const bd = b.sentAt ? new Date(b.sentAt).getTime() : 0;
      return bd - ad;
    });
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (listFilter === "unread") {
      return sortedNotifications.filter((n) => !n.isRead);
    }
    return sortedNotifications;
  }, [sortedNotifications, listFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const [items, count] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(Array.isArray(items) ? items : []);
      const nextUnread = typeof count === "number" ? count : 0;
      setUnreadCount(nextUnread);
      syncUnreadCount(nextUnread);
    } catch (e) {
      console.error("Erreur chargement notifications", e);
      setNotifications([]);
      setUnreadCount(0);
      syncUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      decrementUnreadCount(1);
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message:
          e.response?.data?.message ||
          "Impossible de marquer comme lu. Nouvelle tentative…",
      });
      await load();
    } finally {
      setMarkingId(null);
    }
  };

  const readCount = Math.max(0, notifications.length - unreadCount);

  const handleFilterChange = (_e, value) => {
    if (value !== null) setListFilter(value);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        fontFamily: appTheme.typography.fontFamily,
        background: "linear-gradient(180deg, #fffefb 0%, #E8F3FC 38%, #F0F7FF 100%)",
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3 },
        pb: 6,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          right: { md: "-6%" },
          top: "5%",
          width: { xs: 200, md: 340 },
          height: { xs: 200, md: 340 },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: { md: "-4%" },
          bottom: "10%",
          width: { xs: 220, md: 300 },
          height: { xs: 220, md: 300 },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1120,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) minmax(260px, 300px)" },
          gap: { xs: 2.5, md: 3 },
          alignItems: "start",
        }}
      >
        {/* Hero — pleine largeur */}
        <Paper
          elevation={0}
          sx={{
            gridColumn: { xs: "1", lg: "1 / -1" },
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${borderSubtle}`,
            boxShadow: "0 8px 32px rgba(15, 39, 68, 0.08)",
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: { xs: 2.5, sm: 3 },
              background: `linear-gradient(105deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.5) 45%, rgba(236,253,245,0.4) 100%)`,
              borderBottom: `1px solid ${borderSubtle}`,
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    background: appTheme.gradients.navbar,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 18px rgba(34, 211, 238, 0.25)",
                  }}
                >
                  <NotificationsActiveOutlinedIcon sx={{ color: appTheme.colors.dark, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    component="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "1.45rem", sm: "1.75rem" },
                      color: inkHeading,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                    }}
                  >
                    Notifications
                  </Typography>
                  <Typography sx={{ color: muted, fontSize: 14, fontWeight: 600, mt: 0.35 }}>
                    Messages du commissaire et de l&apos;organisation
                  </Typography>
                </Box>
              </Stack>
              <Chip
                icon={<InboxOutlinedIcon sx={{ fontSize: 18 }} />}
                label={
                  unreadCount > 0
                    ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                    : "À jour"
                }
                sx={{
                  fontWeight: 800,
                  alignSelf: { xs: "flex-start", sm: "center" },
                  bgcolor: unreadCount > 0 ? "rgba(8, 145, 178, 0.12)" : "rgba(22, 163, 74, 0.12)",
                  color: unreadCount > 0 ? "#0e7490" : "#15803d",
                  border: `1px solid ${unreadCount > 0 ? "rgba(8, 145, 178, 0.25)" : "rgba(22, 163, 74, 0.25)"}`,
                }}
              />
            </Stack>
          </Box>
        </Paper>

        {/* Colonne principale : liste */}
        <Box sx={{ minWidth: 0, gridColumn: "1" }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${borderSubtle}`,
              bgcolor: "rgba(255,255,255,0.96)",
              boxShadow: "0 4px 24px rgba(15, 39, 68, 0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                borderBottom: `1px solid ${borderSubtle}`,
                bgcolor: "rgba(248, 250, 252, 0.8)",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: inkHeading }}>
                Fil des messages
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={listFilter}
                onChange={handleFilterChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2,
                    borderColor: borderSubtle,
                    color: muted,
                    "&.Mui-selected": {
                      bgcolor: "rgba(34, 211, 238, 0.14)",
                      color: "#0e7490",
                      borderColor: "rgba(8, 145, 178, 0.35)",
                      "&:hover": { bgcolor: "rgba(34, 211, 238, 0.2)" },
                    },
                  },
                }}
              >
                <ToggleButton value="all">Toutes</ToggleButton>
                <ToggleButton value="unread">Non lues</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress sx={{ color: "#0891b2" }} />
              </Box>
            ) : displayedNotifications.length === 0 ? (
              <Box sx={{ px: 3, py: 8, textAlign: "center" }}>
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 56, color: "rgba(8, 145, 178, 0.35)", mb: 2 }} />
                <Typography sx={{ fontWeight: 800, fontSize: 18, color: inkHeading, mb: 1 }}>
                  {listFilter === "unread" && sortedNotifications.length > 0
                    ? "Aucun message non lu"
                    : "Aucune notification"}
                </Typography>
                <Typography sx={{ color: muted, fontWeight: 500, maxWidth: 360, mx: "auto", lineHeight: 1.6 }}>
                  {listFilter === "unread" && sortedNotifications.length > 0
                    ? "Tous vos messages ont été lus. Revenez plus tard ou consultez l’onglet « Toutes »."
                    : "Les alertes de validation et les messages importants apparaîtront ici."}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={0} sx={{ p: { xs: 1.5, sm: 2 } }}>
                {displayedNotifications.map((n) => {
                  const isRead = Boolean(n.isRead);
                  const rel = formatRelative(n.sentAt);
                  const style = TYPE_STYLE[n.type] || TYPE_STYLE.default;
                  let showOpen = false;
                  if (n?.link && origin) {
                    try {
                      showOpen = new URL(n.link).origin !== origin;
                    } catch {
                      showOpen = false;
                    }
                  }

                  return (
                    <Paper
                      key={n.id}
                      elevation={0}
                      sx={{
                        p: { xs: 2, sm: 2.25 },
                        borderRadius: 2.5,
                        border: `1px solid ${borderSubtle}`,
                        borderLeft: `4px solid ${style.accent}`,
                        bgcolor: isRead ? "#fff" : "rgba(224, 242, 254, 0.35)",
                        boxShadow: isRead ? "none" : "0 4px 16px rgba(8, 145, 178, 0.08)",
                        transition: "box-shadow 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(15, 39, 68, 0.08)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: style.bg,
                            color: style.fg,
                            border: "1px solid rgba(255,255,255,0.8)",
                            boxShadow: "0 2px 10px rgba(15,23,42,0.06)",
                          }}
                        >
                          {style.icon}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={0.5}
                            alignItems={{ sm: "flex-start" }}
                            justifyContent="space-between"
                            sx={{ gap: { sm: 2 } }}
                          >
                            <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                              <Typography
                                component="h2"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: { xs: 16, sm: 17 },
                                  color: ink,
                                  lineHeight: 1.35,
                                  letterSpacing: "-0.02em",
                                }}
                              >
                                {n.title || "Notification"}
                              </Typography>
                              {!isRead ? (
                                <Chip
                                  label="Nouveau"
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontWeight: 800,
                                    fontSize: 11,
                                    bgcolor: "rgba(8, 145, 178, 0.15)",
                                    color: "#0e7490",
                                  }}
                                />
                              ) : null}
                            </Stack>
                            <Box sx={{ textAlign: { xs: "left", sm: "right" }, flexShrink: 0 }}>
                              <Typography sx={{ color: muted, fontSize: 12, fontWeight: 700 }}>
                                {formatDateTime(n.sentAt)}
                              </Typography>
                              {rel ? (
                                <Typography sx={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{rel}</Typography>
                              ) : null}
                            </Box>
                          </Stack>

                          <Typography
                            sx={{
                              color: "#334155",
                              fontSize: 14,
                              fontWeight: 500,
                              lineHeight: 1.65,
                              mt: 1,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {n.message || ""}
                          </Typography>

                          <Stack
                            direction="row"
                            flexWrap="wrap"
                            sx={{ mt: 1.75, alignItems: "center", gap: 1 }}
                          >
                            {n.type ? (
                              <Chip
                                size="small"
                                label={NOTIFICATION_TYPE_LABELS[n.type] || String(n.type)}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: 11,
                                  background: style.bg,
                                  color: style.fg,
                                  border: "1px solid rgba(15,23,42,0.06)",
                                }}
                              />
                            ) : null}
                            {n.incidentStatus ? (
                              <Chip
                                size="small"
                                label={`Incident : ${n.incidentStatus}`}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 11,
                                  backgroundColor: "rgba(167, 139, 250, 0.15)",
                                  color: "#5b21b6",
                                }}
                              />
                            ) : null}

                            <Box sx={{ flex: 1, minWidth: 8 }} />

                            {showOpen && n.link ? (
                              <Button
                                size="small"
                                variant="outlined"
                                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                                onClick={() => window.open(n.link, "_blank", "noopener,noreferrer")}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  borderColor: "rgba(8, 145, 178, 0.45)",
                                  color: "#0e7490",
                                  "&:hover": {
                                    borderColor: "#0891b2",
                                    bgcolor: "rgba(8, 145, 178, 0.06)",
                                  },
                                }}
                              >
                                Ouvrir le lien
                              </Button>
                            ) : null}

                            {!isRead ? (
                              <Button
                                size="small"
                                variant="contained"
                                disabled={markingId === Number(n.id)}
                                onClick={() => handleMarkAsRead(n.id)}
                                startIcon={<MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} />}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  background: appTheme.gradients.navbar,
                                  color: appTheme.colors.dark,
                                  boxShadow: "0 4px 14px rgba(34, 211, 238, 0.25)",
                                  "&:hover": {
                                    filter: "brightness(0.97)",
                                    boxShadow: "0 6px 18px rgba(15, 39, 68, 0.1)",
                                  },
                                }}
                              >
                                {markingId === Number(n.id) ? "…" : "Marquer comme lu"}
                              </Button>
                            ) : null}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Box>

        {/* Colonne latérale : stats + aide */}
        <Stack spacing={2.25} sx={{ width: "100%", minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${borderSubtle}`,
              background: "linear-gradient(165deg, #ffffff 0%, rgba(224,242,254,0.5) 100%)",
              boxShadow: "0 4px 20px rgba(15, 39, 68, 0.06)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ height: 4, background: appTheme.gradients.navbar }} />
            <Box sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#0e7490",
                  letterSpacing: "0.1em",
                  mb: 1.5,
                }}
              >
                SYNTHÈSE
              </Typography>
              <Stack direction="row" spacing={2} alignItems="baseline">
                <Typography sx={{ fontWeight: 900, fontSize: 40, color: inkHeading, lineHeight: 1 }}>
                  {unreadCount}
                </Typography>
                <Typography sx={{ color: muted, fontSize: 13, fontWeight: 600 }}>
                  non lue{unreadCount > 1 ? "s" : ""}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 13, color: muted, mt: 1.5, lineHeight: 1.5 }}>
                <strong style={{ color: inkHeading }}>{readCount}</strong> lue{readCount > 1 ? "s" : ""} sur{" "}
                <strong style={{ color: inkHeading }}>{notifications.length}</strong>
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${borderSubtle}`,
              bgcolor: "#fff",
              borderLeft: "4px solid #22c55e",
              boxShadow: "0 4px 20px rgba(15, 39, 68, 0.05)",
            }}
          >
            <Typography sx={{ fontWeight: 800, color: inkHeading, mb: 1.5, fontSize: 15 }}>
              Bonnes pratiques
            </Typography>
            <Stack spacing={1.25} sx={{ fontSize: 13, color: muted, lineHeight: 1.55 }}>
              <Typography>• Les retours du commissaire s’affichent ici en priorité.</Typography>
              <Typography>• Marquez comme lu pour distinguer ce qui reste à traiter.</Typography>
              <Typography>• Les liens externes s’ouvrent dans un nouvel onglet sécurisé.</Typography>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${borderSubtle}`,
              background: "linear-gradient(135deg, rgba(236,253,245,0.6) 0%, #fff 100%)",
              borderLeft: "4px solid #0891b2",
            }}
          >
            <Typography sx={{ fontWeight: 800, color: inkHeading, mb: 1, fontSize: 15 }}>
              Après un envoi de documents
            </Typography>
            <Typography sx={{ fontSize: 13, color: muted, lineHeight: 1.55 }}>
              Revenez sur cette page : validation ou refus y est indiqué rapidement, sans avoir à rafraîchir
              constamment votre profil.
            </Typography>
          </Paper>
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity="error"
          variant="filled"
          sx={{ fontWeight: 700 }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
