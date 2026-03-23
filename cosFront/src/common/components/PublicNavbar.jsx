import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import appTheme from "../theme/appTheme";

export default function PublicNavbar({ publicOnly = false, themeVariant = "default" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isDarkHome = themeVariant === "darkHome";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 64,
        background: isDarkHome ? "#020617" : appTheme.gradients.navbar,
        color: isDarkHome ? "#f8fafc" : "#020617",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: isDarkHome ? "1px solid rgba(148,163,184,0.22)" : "none",
      }}
    >
      <Toolbar
        sx={{
          height: "100%",
          display: "flex",
          px: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isDarkHome ? 1.25 : 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            {isDarkHome ? (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #0ea5e9, #22d3ee 45%, #4ade80)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.12), 0 8px 24px rgba(14, 165, 233, 0.45)",
                }}
              >
                <EmojiEventsIcon sx={{ color: "#fff", fontSize: 24 }} />
              </Box>
            ) : (
              <SportsScoreIcon sx={{ fontSize: 22, color: "inherit" }} />
            )}
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: isDarkHome ? 18 : 17, color: isDarkHome ? "#f8fafc" : "inherit", letterSpacing: "-0.02em" }}>
                CiblOrgaSport
              </Typography>
              {isDarkHome && (
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: appTheme.colors.cyan, textTransform: "uppercase", letterSpacing: "0.14em", lineHeight: 1.2 }}>
                  Compétitions · Organisation · Résultats
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: isDarkHome ? 1 : 2 }}>
            {!isDarkHome && !publicOnly && user ? (
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
                    px: isDarkHome ? 2.5 : 3,
                    py: isDarkHome ? 0.9 : undefined,
                    borderRadius: "999px",
                    fontWeight: isDarkHome ? 800 : 600,
                    textTransform: "none",
                    fontSize: isDarkHome ? 14 : undefined,
                    color: isDarkHome ? "#0c4a6e" : "#020617",
                    background: isDarkHome ? "linear-gradient(180deg, #e0f2fe 0%, #bae6fd 45%, #7dd3fc 100%)" : "transparent",
                    border: isDarkHome ? "2px solid rgba(255,255,255,0.35)" : "none",
                    boxShadow: isDarkHome ? "0 4px 18px rgba(125, 211, 252, 0.55)" : "none",
                    "&:hover": {
                      background: isDarkHome
                        ? "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)"
                        : "rgba(2, 6, 23, 0.1)",
                    },
                  }}
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  sx={{
                    px: isDarkHome ? 2.75 : 3,
                    py: isDarkHome ? 0.85 : undefined,
                    borderRadius: "999px",
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: isDarkHome ? 14 : undefined,
                    background: isDarkHome
                      ? "linear-gradient(92deg, #fde047 0%, #facc15 45%, #fbbf24 100%)"
                      : appTheme.colors.dark,
                    color: isDarkHome ? "#0f172a" : appTheme.colors.textPrimary,
                    boxShadow: isDarkHome ? "0 6px 22px rgba(250, 204, 21, 0.5)" : "none",
                    "&:hover": {
                      background: isDarkHome
                        ? "linear-gradient(92deg, #fef08a 0%, #fde047 50%, #f59e0b 100%)"
                        : appTheme.colors.darkSoft,
                    },
                  }}
                >
                  Inscription
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
