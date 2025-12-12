import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SportsScoreIcon />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            CiblOrgaSport
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">
              {user.email} · <strong>{user.role}</strong>
            </Typography>

            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={logout}
            >
              Déconnexion
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
