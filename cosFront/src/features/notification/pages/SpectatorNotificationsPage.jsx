import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotificationUnread } from "../../../common/contexts/NotificationUnreadContext";
import SpectatorSocialShell from "../../spectator/components/SpectatorSocialShell";
import NotificationsPage from "./NotificationsPage";

export default function SpectatorNotificationsPage() {
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
      activeKey="notifications"
      onNavigate={handleShellNavigate}
      unreadCount={unreadCount}
      leftTitle="Espace fan"
      hideRight
      center={
        <Box sx={{ minWidth: 0, ml: { md: -1 } }}>
          <NotificationsPage />
        </Box>
      }
    />
  );
}

