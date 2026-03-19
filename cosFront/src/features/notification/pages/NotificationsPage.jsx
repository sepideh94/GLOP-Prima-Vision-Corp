import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";
import notificationService from "../services/notificationService";

function formatDateTime(sentAt) {
  if (!sentAt) return "-";
  const d = new Date(sentAt);
  if (Number.isNaN(d.getTime())) return String(sentAt);
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <Box
      sx={{
        p: 4,
        background: appTheme.gradients.page,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mb: 3,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 22 }}>
          Mes notifications
        </Typography>
        <Typography sx={{ color: appTheme.colors.textMuted }}>
          {unreadCount} non lues
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : sortedNotifications.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography sx={{ color: appTheme.colors.textMuted }}>
            Aucune notification pour le moment.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sortedNotifications.map((n) => {
            const isRead = Boolean(n.isRead);
            let showOpen = false;
            if (n?.link && origin) {
              try {
                showOpen = new URL(n.link).origin !== origin;
              } catch {
                // ignore malformed links
                showOpen = false;
              }
            }
            return (
              <Paper
                key={n.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: isRead
                    ? "1px solid rgba(148,163,184,0.35)"
                    : `2px solid rgba(34,211,238,0.6)`,
                  background: appTheme.gradients.card,
                  color: appTheme.colors.textPrimary, // Ensure readability on dark card
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900, mb: 0.8, fontSize: 16, color: appTheme.colors.textPrimary }}>
                      {n.title || "Notification"}
                    </Typography>
                    <Typography
                      sx={{
                        color: appTheme.colors.textSecondary,
                        mb: 1.4,
                        fontSize: 14,
                        lineHeight: 1.4,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {n.message || ""}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {n.incidentStatus && (
                        <Chip
                          label={`Incident: ${n.incidentStatus}`}
                          sx={{
                            background: "rgba(167,139,250,0.18)",
                            color: "#e9d5ff",
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {n.type && (
                        <Chip
                          label={String(n.type)}
                          sx={{
                            background: "rgba(34,211,238,0.16)",
                            color: "#67e8f9",
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ width: 220, textAlign: "right" }}>
                    <Typography
                      sx={{
                        color: appTheme.colors.textMuted,
                        fontSize: 12,
                        mb: 1,
                      }}
                    >
                      {formatDateTime(n.sentAt)}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      {!isRead && (
                        <Button
                          variant="contained"
                          onClick={() => handleMarkAsRead(n.id)}
                          sx={{
                            borderRadius: appTheme.radius.pill,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Marquer lu
                        </Button>
                      )}

                      {showOpen && n.link && (
                        <Button
                          variant="outlined"
                          onClick={() => window.open(n.link, "_blank", "noopener,noreferrer")}
                          sx={{
                            borderColor: "rgba(34,211,238,0.5)",
                            color: "#67e8f9",
                            borderRadius: appTheme.radius.pill,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Ouvrir
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

