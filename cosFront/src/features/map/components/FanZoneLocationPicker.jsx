import { useState, useRef, useCallback, useEffect } from "react";
import {
  Box, Tabs, Tab, TextField, Paper, List, ListItemButton,
  ListItemIcon, ListItemText, Typography, CircularProgress, Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { GOOGLE_MAP_ID } from "../googleMapConfig";

/**
 * Props:
 *   value: { address, latitude, longitude } | null
 *   onChange: ({ address, latitude, longitude }) => void
 */
export default function FanZoneLocationPicker({ value, onChange }) {
  const [tab, setTab] = useState(0);
  const [inputValue, setInputValue] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    value ? { lat: value.latitude, lng: value.longitude } : { lat: 50.604457, lng: 3.136702 }
  );

  const placesLib = useMapsLibrary("places");
  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    sessionToken.current = new placesLib.AutocompleteSessionToken();
  }, [placesLib]);

  const fetchSuggestions = useCallback((text) => {
    if (!autocompleteService.current || text.length < 3) { setSuggestions([]); return; }
    autocompleteService.current.getPlacePredictions(
      { input: text, sessionToken: sessionToken.current, types: ["establishment", "geocode"] },
      (predictions, status) => setSuggestions(status === "OK" && predictions ? predictions : [])
    );
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    if (value) onChange(null);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelectSuggestion = (prediction) => {
    setSuggestions([]);
    setLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      setLoading(false);
      if (status !== "OK" || !results[0]) return;
      const address = results[0].formatted_address;
      const latitude = results[0].geometry.location.lat();
      const longitude = results[0].geometry.location.lng();
      setInputValue(address);
      setMapCenter({ lat: latitude, lng: longitude });
      onChange({ address, latitude, longitude });
      if (window.google?.maps?.places?.AutocompleteSessionToken) {
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    });
  };

  const handleMapClick = (e) => {
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const address = status === "OK" && results[0] ? results[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setInputValue(address);
      onChange({ address, latitude: lat, longitude: lng });
    });
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1.5 }}>
        <Tab icon={<SearchIcon fontSize="small" />} iconPosition="start" label="Recherche" />
        <Tab icon={<MapIcon fontSize="small" />} iconPosition="start" label="Clic sur la carte" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ position: "relative" }}>
          <TextField
            fullWidth
            label="Adresse *"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ex: Stade Pierre-Mauroy, Villeneuve-d'Ascq..."
            slotProps={{
              input: {
                endAdornment: loading ? <CircularProgress size={16} /> : null,
              },
            }}
          />
          {suggestions.length > 0 && (
            <Paper elevation={4} sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1300, maxHeight: 260, overflowY: "auto" }}>
              <List dense disablePadding>
                {suggestions.map((s) => (
                  <ListItemButton key={s.place_id} onClick={() => handleSelectSuggestion(s)} divider>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={s.structured_formatting?.main_text}
                      secondary={s.structured_formatting?.secondary_text}
                      slotProps={{ primary: { variant: "body2" }, secondary: { variant: "caption" } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
          {value && (
            <Chip icon={<LocationOnIcon />} label={value.address} size="small" color="primary" variant="outlined" sx={{ mt: 0.5, maxWidth: "100%" }} />
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Cliquez sur la carte pour placer la fan zone
          </Typography>
          <Box sx={{ height: 300, borderRadius: 1, overflow: "hidden" }}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={13}
              mapId={GOOGLE_MAP_ID}
              style={{ width: "100%", height: "100%" }}
              onClick={handleMapClick}
            >
              {value && (
                <AdvancedMarker position={{ lat: value.latitude, lng: value.longitude }}>
                  <Pin background="#f57c00" glyphColor="#fff" borderColor="#e65100" />
                </AdvancedMarker>
              )}
            </Map>
          </Box>
          {value && (
            <Chip icon={<LocationOnIcon />} label={value.address} size="small" color="primary" variant="outlined" sx={{ mt: 1, maxWidth: "100%" }} />
          )}
        </Box>
      )}
    </Box>
  );
}
