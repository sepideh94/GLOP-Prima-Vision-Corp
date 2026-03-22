import { Box, Typography, Paper } from "@mui/material";
import SpectatorMapView from "../components/SpectatorMapView";

export default function AdminMapPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Carte opérations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Carte interactive avec le suivi des athlètes — réservé aux administrateurs.
      </Typography>
      <Paper sx={{ p: 2 }}>
        <SpectatorMapView variant="admin" />
      </Paper>
    </Box>
  );
}
