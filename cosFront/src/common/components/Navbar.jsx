import { AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem, Badge } from "@mui/material";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import appTheme from "../theme/appTheme";
import { useState } from "react";
import { useEffect } from "react";
import notificationService from "../../features/notification/services/notificationService";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isSpectatorArea = location.pathname.startsWith("/spectator");
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const goFollowedCompetitions = () => {
    handleCloseMenu();
    navigate("/spectator?mode=favorites");
  };

  const goProfile = () => {
    handleCloseMenu();
    navigate("/spectator/profile");
  };

  const goNotifications = () => {
    handleCloseMenu();
    navigate("/spectator/notifications");
  };

  const goFriends = () => {
    handleCloseMenu();
    // UI placeholder (pas encore d'endpoint / page dédiée)
    window.alert("Retrouver des amis : fonctionnalité à venir.");
  };

  useEffect(() => {
    if (!user) return undefined;
    let mounted = true;
    const loadUnread = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        if (mounted) setUnreadCount(count);
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };
    loadUnread();
    const timer = setInterval(loadUnread, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [user]);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 64,
        background: appTheme.gradients.navbar,
        color: "#020617",
        zIndex: (theme) => theme.zIndex.drawer + 1, 
      }}
    >
      <Toolbar
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SportsScoreIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
            CiblOrgaSport
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isSpectatorArea ? (
              <>
                <IconButton onClick={handleOpenMenu} sx={{ color: "#020617" }}>
                  <Badge badgeContent={unreadCount > 99 ? "99+" : unreadCount} color="error">
                    <MenuIcon />
                  </Badge>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                  PaperProps={{ sx: { minWidth: 240 } }}
                >
                  <MenuItem onClick={goFollowedCompetitions}>
                    <FavoriteIcon fontSize="small" sx={{ mr: 1, color: appTheme.colors.violet }} />
                    Compétitions suivies
                  </MenuItem>
                  <MenuItem onClick={goProfile}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: appTheme.colors.cyan }} />
                    Mon profil
                  </MenuItem>
                <MenuItem onClick={goNotifications}>
                  <NotificationsIcon
                    fontSize="small"
                    sx={{ mr: 1, color: appTheme.colors.violet }}
                  />
                  Mes notifications {unreadCount > 0 ? `(${unreadCount > 99 ? "99+" : unreadCount})` : ""}
                </MenuItem>
                  <MenuItem onClick={goFriends}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1, color: appTheme.colors.green }} />
                    Retrouver des amis
                  </MenuItem>
                </Menu>

                <Button
                  onClick={logout}
                  sx={{
                    px: 3,
                    borderRadius: "999px",
                    fontWeight: 700,
                    textTransform: "none",
                    background: appTheme.colors.dark,
                    color: appTheme.colors.textPrimary,
                  }}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: 13 }}>
                  {user.email} · <strong>{user.role}</strong>
                </Typography>

                <Button
                  onClick={logout}
                  sx={{
                    px: 3,
                    borderRadius: "999px",
                    fontWeight: 700,
                    textTransform: "none",
                    background: appTheme.colors.dark,
                    color: appTheme.colors.textPrimary,
                  }}
                >
                  Déconnexion
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
