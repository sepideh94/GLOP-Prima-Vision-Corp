import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import MapView from "./MapView";
import DirectionsPanel from "./DirectionsPanel";
import useUserGeolocation from "../hooks/useUserGeolocation";
import useNearbyPlaces from "../hooks/useNearbyPlaces";

export default function SpectatorMapView() {
  const { position, loading: locLoading, error: locError, locate } = useUserGeolocation();
  const { trials, fanZones, loading: searchLoading, error: searchError, search } = useNearbyPlaces();

  const [showTrials, setShowTrials] = useState(true);
  const [showFanZones, setShowFanZones] = useState(true);
  const [radiusKm, setRadiusKm] = useState(10);
  const [routePath, setRoutePath] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);

  const handleSearch = () => {
    if (position) search(position.lat, position.lng, radiusKm);
  };

  const markers = [];
  if (position) {
    markers.push({ id: "user", lat: position.lat, lng: position.lng, type: "USER", label: "Ma position" });
  }
  if (showTrials) {
    trials.forEach((t) => {
      if (t.siteLatitude && t.siteLongitude) {
        markers.push({
          id: `trial-${t.id}`,
          lat: t.siteLatitude,
          lng: t.siteLongitude,
          type: "EVENT",
          label: t.name,
          info: `${t.startDate} à ${t.startHour}`,
        });
      }
    });
  }
  if (showFanZones) {
    fanZones.forEach((fz) => {
      markers.push({
        id: `fz-${fz.id}`,
        lat: fz.latitude,
        lng: fz.longitude,
        type: "FAN_ZONE",
        label: fz.name,
        info: fz.address,
      });
    });
  }

  const mapCenter = position || { lat: 48.8566, lng: 2.3522 };

  return (
    <Box>
      {locError && <Alert severity="warning" sx={{ mb: 1 }}>{locError}</Alert>}
      {searchError && <Alert severity="error" sx={{ mb: 1 }}>Erreur lors de la recherche</Alert>}

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, alignItems: "center" }}>
        <Button
          variant="outlined"
          startIcon={locLoading ? <CircularProgress size={14} /> : <MyLocationIcon />}
          onClick={locate}
          disabled={locLoading}
          size="small"
        >
          Me localiser
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 180 }}>
          <Typography variant="body2" noWrap>Rayon : {radiusKm} km</Typography>
          <Slider
            value={radiusKm}
            min={1}
            max={50}
            onChange={(_, v) => setRadiusKm(v)}
            size="small"
            sx={{ width: 100 }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={searchLoading ? <CircularProgress size={14} /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={!position || searchLoading}
          size="small"
        >
          Rechercher
        </Button>
      </Box>

      <FormGroup row sx={{ mb: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={showTrials} onChange={(e) => setShowTrials(e.target.checked)} size="small" />}
          label="Épreuves"
        />
        <FormControlLabel
          control={<Checkbox checked={showFanZones} onChange={(e) => setShowFanZones(e.target.checked)} size="small" />}
          label="Fan Zones"
        />
      </FormGroup>

      <MapView
        markers={markers}
        polylinePath={routePath}
        center={mapCenter}
        zoom={13}
        height="380px"
      />

      {fanZones.length > 0 && showFanZones && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Fan Zones à proximité
          </Typography>
          <List dense>
            {fanZones.map((fz, i) => (
              <div key={fz.id}>
                <ListItem button onClick={() => setSelectedDest({ type: "fanZone", fanZoneId: fz.id })}>
                  <ListItemText primary={fz.name} secondary={fz.address} />
                </ListItem>
                {i < fanZones.length - 1 && <Divider />}
              </div>
            ))}
          </List>

          {selectedDest && position && (
            <DirectionsPanel
              originLat={position.lat}
              originLng={position.lng}
              destinationParams={selectedDest.type === "fanZone"
                ? { fanZoneId: selectedDest.fanZoneId }
                : { lat: selectedDest.lat, lng: selectedDest.lng }}
              onRoute={setRoutePath}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
