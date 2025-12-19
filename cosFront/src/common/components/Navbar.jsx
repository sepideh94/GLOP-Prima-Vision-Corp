import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #E5E7EB, #CBD5E1)",
        color: "#020617",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SportsScoreIcon sx={{ color: "#65A30D" }} />
          <Typography sx={{ fontWeight: 800 }}>
            CiblOrgaSport
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "#334155" }}>
              {user.email} · <strong>{user.role}</strong>
            </Typography>

            <Button
              onClick={logout}
              sx={{
                px: 3,
                borderRadius: "999px",
                fontWeight: 700,
                textTransform: "none",
                color: "#020617",
                background:
                  "linear-gradient(90deg, #22D3EE 0%, #A3E635 100%)",
                boxShadow: "0 10px 30px rgba(34,211,238,0.35)",
              }}
            >
              Déconnexion
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
