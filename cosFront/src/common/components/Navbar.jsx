import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import appTheme from "../theme/appTheme";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isSpectatorArea = location.pathname.startsWith("/spectator");

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
              <Button
                onClick={logout}
                startIcon={<LogoutIcon />}
                sx={{
                  px: 2,
                  borderRadius: "999px",
                  fontWeight: 800,
                  textTransform: "none",
                  color: "#020617",
                  border: "1px solid rgba(15,23,42,0.12)",
                  bgcolor: "rgba(255,255,255,0.55)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.75)" },
                }}
              >
                Déconnexion
              </Button>
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
