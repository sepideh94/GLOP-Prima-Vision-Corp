import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Divider,
  Snackbar,
  Alert as MuiAlert,
  Paper,
  Stack,
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
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

  const load = async () => {
    setLoading(true);
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        background:
          "linear-gradient(160deg, #fffbeb 0%, #ecfdf5 32%, #e0f2fe 65%, #ffedd5 100%)",
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3 },
        pb: 6,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          right: { md: "-8%" },
          top: "8%",
          width: { xs: 180, md: 320 },
          height: { xs: 180, md: 320 },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: { md: "-5%" },
          bottom: "12%",
          width: { xs: 200, md: 280 },
          height: { xs: 200, md: 280 },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.22) 0%, transparent 70%)",
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
          maxWidth: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.55fr) minmax(0, 1fr)" },
          gap: { xs: 3, md: 3.5 },
          alignItems: "stretch",
        }}
      >
        <Box sx={{ minWidth: 0, width: "100%", order: { xs: 2, md: 1 } }}>
      <Box
        sx={{
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
          border: "2px solid rgba(234, 88, 12, 0.35)",
          boxShadow: "0 20px 50px rgba(234, 88, 12, 0.12), 0 8px 30px rgba(14, 165, 233, 0.1)",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.75,
            background:
              "linear-gradient(110deg, #fbbf24 0%, #22c55e 38%, #0ea5e9 72%, #fb923c 100%)",
            borderBottom: "3px solid rgba(15, 23, 42, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              }}
            >
              <NotificationsActiveOutlinedIcon sx={{ color: "#0369a1", fontSize: 30 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 22, sm: 26 },
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                  textShadow: "0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                Centre de notifications
              </Typography>
              <Typography
                sx={{
                  color: "#1e293b",
                  fontSize: 15,
                  fontWeight: 700,
                  mt: 0.25,
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""} — restez informé(e) !`
                  : "Tout est à jour — aucun message en attente."}
              </Typography>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#0284c7" }} />
          </Box>
        ) : sortedNotifications.length === 0 ? (
          <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
            <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
              Aucune notification pour le moment.
            </Typography>
          </Box>
        ) : (
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {sortedNotifications.map((n, idx) => {
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
                <Box key={n.id} component="li">
                  {idx > 0 ? <Divider sx={{ borderColor: "rgba(148,163,184,0.25)" }} /> : null}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      px: 3,
                      py: 2.25,
                      alignItems: "flex-start",
                      background: isRead
                        ? "transparent"
                        : "linear-gradient(90deg, rgba(254, 243, 199, 0.55) 0%, rgba(255,255,255,0.4) 55%)",
                      borderLeft: isRead ? "4px solid transparent" : "4px solid #f59e0b",
                      transition: "background 0.2s ease",
                    }}
                  >
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
                        boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
                        border: "2px solid rgba(255,255,255,0.6)",
                      }}
                    >
                      {style.icon || (
                        <MarkEmailReadOutlinedIcon sx={{ fontSize: 22, opacity: isRead ? 0.5 : 1 }} />
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: 17,
                            color: "#0f172a",
                            lineHeight: 1.35,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {n.title || "Notification"}
                          {!isRead ? (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#0ea5e9",
                                ml: 1,
                                verticalAlign: "middle",
                              }}
                            />
                          ) : null}
                        </Typography>
                        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                          <Typography sx={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                            {formatDateTime(n.sentAt)}
                          </Typography>
                          {rel ? (
                            <Typography sx={{ color: "#94a3b8", fontSize: 11 }}>{rel}</Typography>
                          ) : null}
                        </Box>
                      </Box>

                      <Typography
                        sx={{
                          color: "#334155",
                          fontSize: 15,
                          fontWeight: 500,
                          lineHeight: 1.6,
                          mt: 0.75,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {n.message || ""}
                      </Typography>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25, alignItems: "center" }}>
                        {n.type ? (
                          <Chip
                            size="small"
                            label={NOTIFICATION_TYPE_LABELS[n.type] || String(n.type)}
                            sx={{
                              fontWeight: 900,
                              fontSize: 12,
                              background: style.bg,
                              color: style.fg,
                              border: "1px solid rgba(255,255,255,0.5)",
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
                              backgroundColor: "#ede9fe",
                              color: "#5b21b6",
                            }}
                          />
                        ) : null}

                        <Box sx={{ flex: 1 }} />

                        {!isRead ? (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={markingId === Number(n.id)}
                            onClick={() => handleMarkAsRead(n.id)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 800,
                              borderRadius: 999,
                              background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                              boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #16a34a, #0284c7)",
                              },
                            }}
                          >
                            {markingId === Number(n.id) ? "…" : "Marquer comme lu"}
                          </Button>
                        ) : null}

                        {showOpen && n.link ? (
                          <Button
                            size="small"
                            variant="outlined"
                            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                            onClick={() => window.open(n.link, "_blank", "noopener,noreferrer")}
                            sx={{
                              textTransform: "none",
                              fontWeight: 800,
                              borderRadius: 999,
                              borderColor: "rgba(234, 88, 12, 0.5)",
                              color: "#c2410c",
                            }}
                          >
                            Ouvrir
                          </Button>
                        ) : null}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
        </Box>

        <Box sx={{ minWidth: 0, width: "100%", order: { xs: 1, md: 2 } }}>
          <Stack spacing={2.5} sx={{ width: "100%", height: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid rgba(15, 39, 68, 0.08)",
                background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(254,243,199,0.55) 100%)",
                borderTop: "4px solid #f59e0b",
                boxShadow: "0 12px 32px rgba(245, 158, 11, 0.15)",
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#92400e", letterSpacing: "0.08em", mb: 1 }}>
                RÉSUMÉ
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: 42, color: "#0f2744", lineHeight: 1 }}>
                {unreadCount}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, fontWeight: 600, mb: 2 }}>
                non lue{unreadCount > 1 ? "s" : ""}
              </Typography>
              <Divider sx={{ my: 1.5, borderColor: "rgba(148,163,184,0.35)" }} />
              <Typography sx={{ fontSize: 13, color: "#475569" }}>
                <strong>{readCount}</strong> déjà lue{readCount > 1 ? "s" : ""} sur{" "}
                <strong>{notifications.length}</strong> au total
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: 3,
                border: "1px solid rgba(15, 39, 68, 0.08)",
                background: "linear-gradient(135deg, #fff 0%, #ffedd5 100%)",
                borderLeft: "5px solid #22c55e",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f2744", mb: 1.5, fontSize: 15 }}>
                À savoir
              </Typography>
              <Stack spacing={1.25} sx={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                <Typography>• Les messages du commissaire apparaissent ici en priorité.</Typography>
                <Typography>• Marquez comme lu pour suivre ce qu&apos;il reste à traiter.</Typography>
                <Typography>• Les liens externes s&apos;ouvrent dans un nouvel onglet.</Typography>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: 3,
                border: "1px solid rgba(15, 39, 68, 0.08)",
                background: "linear-gradient(135deg, rgba(254,249,195,0.5), rgba(255,255,255,0.95))",
                borderLeft: "5px solid #0ea5e9",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f2744", mb: 1, fontSize: 15 }}>
                Astuce
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}>
                Pensez à consulter cette page après chaque envoi de documents : la validation ou un refus
                y est notifié rapidement.
              </Typography>
            </Paper>
          </Stack>
        </Box>
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
