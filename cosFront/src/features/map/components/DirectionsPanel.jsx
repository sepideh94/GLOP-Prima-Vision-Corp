import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import directionsService from "../services/directionsService";

const TRAVEL_MODES = [
  { value: "DRIVING", label: "Voiture", icon: <DirectionsCarIcon fontSize="small" /> },
  { value: "WALKING", label: "À pied", icon: <DirectionsWalkIcon fontSize="small" /> },
  { value: "BICYCLING", label: "Vélo", icon: <DirectionsBikeIcon fontSize="small" /> },
];

/**
 * Props:
 *   originLat, originLng — user position
 *   destinationParams — { siteId } or { fanZoneId } or { lat, lng }
 *   onRoute: (polylinePath) => void — called with decoded polyline points
 */
export default function DirectionsPanel({ originLat, originLng, destinationParams, onRoute }) {
  const [mode, setMode] = useState("DRIVING");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetDirections = async () => {
    if (!originLat || !originLng) return;
    setLoading(true);
    setError(null);
    try {
      const data = await directionsService.getDirections({
        originLat,
        originLng,
        travelMode: mode,
        ...destinationParams,
      });
      setResult(data);
      if (onRoute && data.polylinePoints) {
        onRoute(data.polylinePoints);
      }
    } catch {
      setError("Impossible de calculer l'itinéraire");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Itinéraire
      </Typography>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Mode</InputLabel>
          <Select value={mode} label="Mode" onChange={(e) => setMode(e.target.value)}>
            {TRAVEL_MODES.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {m.icon} {m.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          size="small"
          onClick={handleGetDirections}
          disabled={loading || !originLat}
          startIcon={loading ? <CircularProgress size={14} /> : null}
        >
          Calculer
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      {result && !error && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            Distance : <strong>{result.distanceText}</strong>
          </Typography>
          <Typography variant="body2">
            Durée : <strong>{result.durationText}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
