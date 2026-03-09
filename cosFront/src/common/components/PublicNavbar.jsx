import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import appTheme from "../theme/appTheme";

export default function PublicNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <SportsScoreIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
            CiblOrgaSport
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
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
                  "&:hover": {
                    background: appTheme.colors.darkSoft,
                  },
                }}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  px: 3,
                  borderRadius: "999px",
                  fontWeight: 600,
                  textTransform: "none",
                  color: "#020617",
                  "&:hover": {
                    background: "rgba(2, 6, 23, 0.1)",
                  },
                }}
              >
                Connexion
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                sx={{
                  px: 3,
                  borderRadius: "999px",
                  fontWeight: 700,
                  textTransform: "none",
                  background: appTheme.colors.dark,
                  color: appTheme.colors.textPrimary,
                  "&:hover": {
                    background: appTheme.colors.darkSoft,
                  },
                }}
              >
                Inscription
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
