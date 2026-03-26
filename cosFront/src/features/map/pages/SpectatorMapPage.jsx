import { Box, Typography, Paper } from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import SpectatorMapView from "../components/SpectatorMapView";
import { useNavigate } from "react-router-dom";
import { useNotificationUnread } from "../../../common/contexts/NotificationUnreadContext";
import SpectatorSocialShell from "../../spectator/components/SpectatorSocialShell";

const pageInk = "#0f2744";
const pageMuted = "#475569";
const pageBorder = "rgba(15, 39, 68, 0.1)";

export default function SpectatorMapPage() {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationUnread();

  const handleShellNavigate = (key) => {
    if (key === "home") navigate("/spectator");
    if (key === "followed") navigate("/spectator?view=followed");
    if (key === "followed_results") navigate("/spectator?view=followed_results");
    if (key === "map") navigate("/spectator/map");
    if (key === "notifications") navigate("/spectator/notifications");
    if (key === "profile") navigate("/spectator/profile");
    if (key === "tickets") navigate("/spectator/tickets");
  };

  return (
    <SpectatorSocialShell
      activeKey="map"
      onNavigate={handleShellNavigate}
      unreadCount={unreadCount}
      leftTitle="Espace fan"
      hideRight
      center={
        <Box sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              mb: 2.5,
              borderRadius: 3,
              border: `1px solid ${pageBorder}`,
              bgcolor: "rgba(255,255,255,0.98)",
              boxShadow: "0 8px 32px rgba(15, 39, 68, 0.07)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <MapOutlinedIcon sx={{ fontSize: 36, color: "#15803d" }} />
              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "1.45rem", sm: "1.75rem" },
                    color: pageInk,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Carte & lieux
                </Typography>
                <Typography sx={{ mt: 0.5, color: pageMuted, fontWeight: 600, fontSize: 15, lineHeight: 1.5 }}>
                  Repérez les zones fan et les points d’intérêt comme sur une appli d’événement sportif.
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: `1px solid ${pageBorder}`,
              bgcolor: "rgba(255,255,255,0.96)",
              boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
              overflow: "hidden",
            }}
          >
            <SpectatorMapView />
          </Paper>
        </Box>
      }
    />
  );
}
