import { Box, Typography, Paper } from "@mui/material";
import SpectatorMapView from "../components/SpectatorMapView";

export default function SpectatorMapPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Carte interactive
      </Typography>
      <Paper sx={{ p: 2 }}>
        <SpectatorMapView />
      </Paper>
    </Box>
  );
}
