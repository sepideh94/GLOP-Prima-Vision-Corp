import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import siteService from "../../../common/api/siteService";
import api from "../../../common/api/axiosInstance";

/**
 * Champ de sélection de site avec recherche Google Places.
 *
 * Flux :
 *  1. L'utilisateur tape une adresse
 *  2. Google Places propose des suggestions en temps réel
 *  3. À la sélection, le site est créé en base s'il n'existe pas déjà
 *  4. Un aperçu carte peut être affiché via l'icône 📍
 *
 * Props:
 *   value: number|null  — siteId
 *   onChange: (siteId) => void
 */
export default function SiteSearchInput({ value, onChange }) {
  const placesLib = useMapsLibrary("places");

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const debounceTimer = useRef(null);

  // Init Google Places AutocompleteService
  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    sessionToken.current = new placesLib.AutocompleteSessionToken();
  }, [placesLib]);

  // Si un siteId est déjà sélectionné (mode édition), le charger
  useEffect(() => {
    if (!value) return;
    siteService.getById(value)
      .then((site) => {
        setSelectedSite(site);
        setInputValue(site.adress || "");
      })
      .catch(() => {});
  }, [value]);

  // Recherche Places avec debounce 300ms
  const fetchSuggestions = useCallback((text) => {
    if (!autocompleteService.current || text.length < 3) {
      setSuggestions([]);
      return;
    }
    autocompleteService.current.getPlacePredictions(
      {
        input: text,
        sessionToken: sessionToken.current,
        types: ["establishment", "geocode"],
      },
      (predictions, status) => {
        if (status === "OK" && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    if (selectedSite) {
      setSelectedSite(null);
      onChange("");
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelectSuggestion = async (prediction) => {
    setSuggestions([]);
    setLoading(true);

    // Récupérer les détails du lieu (coordonnées)
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, async (results, status) => {
      setLoading(false);
      if (status !== "OK" || !results[0]) return;

      const { lat, lng } = results[0].geometry.location;
      const adress = results[0].formatted_address;
      const latitude = lat();
      const longitude = lng();

      setInputValue(adress);

      // Vérifier si le site existe déjà (même adresse)
      try {
        const allSites = await siteService.getAll();
        const existing = allSites.find(
          (s) => s.adress === adress || (
            Math.abs(s.latitude - latitude) < 0.0001 &&
            Math.abs(s.longitude - longitude) < 0.0001
          )
        );

        if (existing) {
          setSelectedSite(existing);
          onChange(existing.id);
        } else {
          // Créer le site en base
          setSaving(true);
          const created = await api.post("/api/admin/sites", { adress, latitude, longitude });
          setSelectedSite(created.data);
          onChange(created.data.id);
          setSaving(false);
        }
      } catch {
        setSaving(false);
      }

      // Renouveler le session token après sélection
      if (window.google?.maps?.places?.AutocompleteSessionToken) {
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    });
  };

  const handleClear = () => {
    setSelectedSite(null);
    setInputValue("");
    setSuggestions([]);
    onChange("");
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        fullWidth
        label="Site *"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Rechercher un lieu (ex: Piscine Olympique de Paris...)"
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (loading || saving)
              ? <CircularProgress size={16} />
              : selectedSite
                ? (
                  <IconButton size="small" onClick={handleClear} sx={{ p: 0.25 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )
                : null,
          },
        }}
      />

      {saving && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Enregistrement du site...
        </Typography>
      )}

      {selectedSite && !saving && (
        <Chip
          icon={<LocationOnIcon />}
          label={selectedSite.adress}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 0.5, maxWidth: "100%" }}
        />
      )}

      {suggestions.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          <List dense disablePadding>
            {suggestions.map((s) => (
              <ListItemButton
                key={s.place_id}
                onClick={() => handleSelectSuggestion(s)}
                divider
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={s.structured_formatting?.main_text}
                  secondary={s.structured_formatting?.secondary_text}
                  slotProps={{
                    primary: { variant: "body2" },
                    secondary: { variant: "caption" },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
