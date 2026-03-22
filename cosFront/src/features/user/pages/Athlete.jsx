import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import StopIcon from "@mui/icons-material/Stop";
import SensorsIcon from "@mui/icons-material/Sensors";
import { useAuth } from "../../../common/contexts/AuthContext";
import useAthleteTracking from "../../map/hooks/useAthleteTracking";

export default function Athlete() {
  const { user } = useAuth();
  const { tracking, error, startTracking, stopTracking } = useAthleteTracking(user?.id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmStart = () => {
    setConfirmOpen(false);
    startTracking();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Tableau de bord Athlète
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        {tracking ? (
          <>
            <Chip
              icon={<SensorsIcon />}
              label="Suivi de position actif"
              color="success"
            />
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopTracking}
            >
              Arrêter le suivi
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<MyLocationIcon />}
            onClick={() => setConfirmOpen(true)}
          >
            Activer le suivi de position
          </Button>
        )}
      </Box>

      {error && <Alert severity="warning" sx={{ maxWidth: 480 }}>{error}</Alert>}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Activer le suivi de position ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            En activant le suivi, votre position GPS sera envoyée à nos serveurs toutes les 30 secondes.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Les organisateurs et les spectateurs pourront voir votre position en temps réel sur la carte pendant la compétition.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleConfirmStart} startIcon={<MyLocationIcon />}>
            Activer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
