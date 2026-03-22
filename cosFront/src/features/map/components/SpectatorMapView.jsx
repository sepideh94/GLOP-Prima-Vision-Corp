import { useState, useRef, useEffect } from "react";
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
  ListItemButton,
  ListItemIcon,
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
import { formatAthleteMapLabel } from "../athleteDisplayName";
import MarkerColorDot from "./MarkerColorDot";
import { getApiErrorMessage } from "../../../common/utils/apiErrorMessage";

/**
 * @param {{ variant?: "spectator" | "admin" }} props
 * — `admin` : même carte + couche « athlètes en suivi » avec prénom/nom (API admin uniquement).
 */
export default function SpectatorMapView({ variant = "spectator" }) {
  const isAdminMap = variant === "admin";
  const { position, loading: locLoading, error: locError, locate } = useUserGeolocation();
  const {
    trials,
    fanZones,
    trackedAthletes,
    loading: searchLoading,
    error: searchError,
    search,
    searchEpoch,
  } = useNearbyPlaces({ includeAdminAthleteLocations: isAdminMap });

  const [showTrials, setShowTrials] = useState(true);
  const [showFanZones, setShowFanZones] = useState(true);
  const [showAthletes, setShowAthletes] = useState(true);
  const [radiusKm, setRadiusKm] = useState(10);
  const [routePath, setRoutePath] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [mapRecenterNonce, setMapRecenterNonce] = useState(0);
  const pendingLocateSearch = useRef(false);

  const handleSearch = () => {
    if (position) search(position.lat, position.lng, radiusKm);
  };

  const handleLocate = async () => {
    pendingLocateSearch.current = true;
    const ok = await locate();
    if (!ok) pendingLocateSearch.current = false;
  };

  useEffect(() => {
    if (!position || !pendingLocateSearch.current) return;
    pendingLocateSearch.current = false;
    search(position.lat, position.lng, radiusKm);
    setMapRecenterNonce((n) => n + 1);
  }, [position, search, radiusKm]);

  const markers = [];
  if (position) {
    markers.push({ id: "user", lat: position.lat, lng: position.lng, type: "USER", label: "Ma position" });
  }
  if (showTrials) {
    trials.forEach((t) => {
      if (t.siteLatitude != null && t.siteLongitude != null) {
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
  const athleteLayerVisible = isAdminMap && showAthletes;
  if (athleteLayerVisible) {
    trackedAthletes.forEach((a) => {
      markers.push({
        id: `athlete-${a.athleteId}`,
        lat: a.latitude,
        lng: a.longitude,
        type: "ATHLETE",
        label: formatAthleteMapLabel(a),
        info: a.timestamp ? `Dernière position : ${a.timestamp}` : "Suivi actif",
      });
    });
  }

  const mapCenter = position || { lat: 48.8566, lng: 2.3522 };

  const hasResults =
    (showTrials && trials.length > 0) ||
    (showFanZones && fanZones.length > 0) ||
    (athleteLayerVisible && trackedAthletes.length > 0);

  const searchedOnce = searchEpoch > 0;

  let destinationParams = null;
  if (selectedDest?.type === "fanZone") {
    destinationParams = { fanZoneId: selectedDest.fanZoneId };
  } else if (selectedDest?.type === "latlng") {
    destinationParams = {
      toLatitude: selectedDest.toLatitude,
      toLongitude: selectedDest.toLongitude,
    };
  }

  return (
    <Box>
      {locError && <Alert severity="warning" sx={{ mb: 1 }}>{locError}</Alert>}
      {searchError && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {getApiErrorMessage(searchError, "Erreur lors de la recherche à proximité.")}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, alignItems: "center" }}>
        <Button
          variant="outlined"
          startIcon={locLoading ? <CircularProgress size={14} /> : <MyLocationIcon />}
          onClick={handleLocate}
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
          label="Fan zones"
        />
        {isAdminMap && (
          <FormControlLabel
            control={<Checkbox checked={showAthletes} onChange={(e) => setShowAthletes(e.target.checked)} size="small" />}
            label="Athlètes (suivi)"
          />
        )}
      </FormGroup>

      <MapView
        markers={markers}
        polylinePath={routePath}
        center={mapCenter}
        zoom={13}
        recenterNonce={mapRecenterNonce}
        height="380px"
      />

      {searchLoading ? null : (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            À proximité
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1.5, alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <MarkerColorDot markerType="EVENT" />
              <Typography variant="caption" color="text.secondary">Épreuve (site)</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <MarkerColorDot markerType="FAN_ZONE" />
              <Typography variant="caption" color="text.secondary">Fan zone</Typography>
            </Box>
            {isAdminMap && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <MarkerColorDot markerType="ATHLETE" />
                <Typography variant="caption" color="text.secondary">Athlète (suivi)</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <MarkerColorDot markerType="USER" />
              <Typography variant="caption" color="text.secondary">Vous</Typography>
            </Box>
          </Box>

          {!searchedOnce && position && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              {isAdminMap
                ? "Localisez-vous puis lancez une recherche pour afficher épreuves, fan zones et athlètes dans le rayon."
                : "Localisez-vous puis lancez une recherche pour afficher épreuves et fan zones dans le rayon."}
            </Typography>
          )}

          {searchedOnce && !hasResults && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              Aucun résultat dans ce rayon (vérifiez aussi les filtres ci-dessus). Élargissez le rayon ou déplacez-vous.
            </Typography>
          )}

          <List dense disablePadding>
            {showTrials &&
              trials.map((t) => (
                <div key={`trial-${t.id}`}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setRoutePath(null);
                        setSelectedDest({
                          type: "latlng",
                          toLatitude: t.siteLatitude,
                          toLongitude: t.siteLongitude,
                        });
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MarkerColorDot markerType="EVENT" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t.name}
                        secondary={`Site d’épreuve — ${t.startDate} à ${t.startHour}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider component="li" />
                </div>
              ))}

            {showFanZones &&
              fanZones.map((fz) => (
                <div key={`fz-${fz.id}`}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setRoutePath(null);
                        const id = fz.id;
                        const numericId = typeof id === "number" ? id : Number(id);
                        if (Number.isFinite(numericId) && String(id) === String(numericId)) {
                          setSelectedDest({ type: "fanZone", fanZoneId: numericId });
                        } else {
                          setSelectedDest({
                            type: "latlng",
                            toLatitude: fz.latitude,
                            toLongitude: fz.longitude,
                          });
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MarkerColorDot markerType="FAN_ZONE" />
                      </ListItemIcon>
                      <ListItemText primary={fz.name} secondary={fz.address || "Fan zone"} />
                    </ListItemButton>
                  </ListItem>
                  <Divider component="li" />
                </div>
              ))}

            {athleteLayerVisible &&
              trackedAthletes.map((a) => (
                <div key={`athlete-${a.athleteId}`}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setRoutePath(null);
                        setSelectedDest({
                          type: "latlng",
                          toLatitude: a.latitude,
                          toLongitude: a.longitude,
                        });
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MarkerColorDot markerType="ATHLETE" />
                      </ListItemIcon>
                      <ListItemText
                        primary={formatAthleteMapLabel(a)}
                        secondary={a.timestamp ? `Dernière position : ${a.timestamp}` : "Position en direct"}
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider component="li" />
                </div>
              ))}
          </List>

          {selectedDest && position && destinationParams && (
            <Box sx={{ mt: 2 }}>
              <DirectionsPanel
                originLat={position.lat}
                originLng={position.lng}
                destinationParams={destinationParams}
                onRoute={setRoutePath}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
