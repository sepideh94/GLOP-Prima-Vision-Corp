import { Box, Typography, Paper } from "@mui/material";
import { useContext } from "react";
import AuthContext from "../../../common/contexts/AuthContext";
import AthleteMapView from "../components/AthleteMapView";

export default function AthleteMapPage() {
  const { user } = useContext(AuthContext);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Ma carte
      </Typography>
      <Paper sx={{ p: 2 }}>
        <AthleteMapView athleteId={user?.id} />
      </Paper>
    </Box>
  );
}
