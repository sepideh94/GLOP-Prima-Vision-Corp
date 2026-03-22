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
import { getApiErrorMessage } from "../../../common/utils/apiErrorMessage";

/**
 * Extrait lat/lng quelle que soit la forme renvoyée par l'API Google Maps (fonction ou nombre).
 */
function readLatLng(location) {
  if (!location) return { latitude: NaN, longitude: NaN };
  const latRaw = location.lat;
  const lngRaw = location.lng;
  const latitude = typeof latRaw === "function" ? latRaw() : Number(latRaw);
  const longitude = typeof lngRaw === "function" ? lngRaw() : Number(lngRaw);
  return { latitude, longitude };
}

function geocodePlaceId(placeId) {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.Geocoder) {
      reject(new Error("GOOGLE_MAPS_NOT_READY"));
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        resolve(results[0]);
      } else {
        reject(new Error(status || "UNKNOWN"));
      }
    });
  });
}

function geocoderStatusMessage(status) {
  switch (status) {
    case "REQUEST_DENIED":
      return "Géocodage refusé : vérifiez la clé Google Maps, les APIs Geocoding / Places activées et la facturation.";
    case "OVER_QUERY_LIMIT":
      return "Quota Google Maps dépassé. Réessayez plus tard.";
    case "ZERO_RESULTS":
      return "Aucun résultat pour ce lieu. Choisissez une autre suggestion.";
    case "INVALID_REQUEST":
      return "Requête de géocodage invalide.";
    case "GOOGLE_MAPS_NOT_READY":
      return "Carte Google non chargée. Rechargez la page ou vérifiez la configuration.";
    default:
      return `Impossible de résoudre l'adresse (${status}). Réessayez ou choisissez une autre suggestion.`;
  }
}

/**
 * Sélection de site via Google Places + enregistrement serveur (resolve or create).
 *
 * Props:
 *   value: number|string — siteId
 *   onChange: (siteId) => void
 */
export default function SiteSearchInput({ value, onChange }) {
  const placesLib = useMapsLibrary("places");

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    sessionToken.current = new placesLib.AutocompleteSessionToken();
  }, [placesLib]);

  useEffect(() => {
    if (!value) return;
    siteService
      .getById(value)
      .then((site) => {
        setSelectedSite(site);
        setInputValue(site.adress || "");
        setSaveError("");
      })
      .catch(() => {});
  }, [value]);

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
    setSaveError("");
    if (selectedSite) {
      setSelectedSite(null);
      onChange("");
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelectSuggestion = async (prediction) => {
    setSuggestions([]);
    setSaveError("");
    setLoading(true);
    setSaving(false);

    try {
      const result = await geocodePlaceId(prediction.place_id);
      const adress = (result.formatted_address || "").trim();
      if (!adress) {
        setSaveError("Adresse introuvable pour ce lieu. Choisissez une autre suggestion.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = readLatLng(result.geometry?.location);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setSaveError("Coordonnées GPS invalides pour ce lieu.");
        setLoading(false);
        return;
      }

      setInputValue(adress);
      setSaving(true);

      const site = await siteService.resolveOrCreate({
        adress,
        latitude,
        longitude,
      });

      setSelectedSite(site);
      onChange(site.id);

      if (window.google?.maps?.places?.AutocompleteSessionToken) {
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    } catch (e) {
      if (e?.message && e.message !== "Error" && !e.response) {
        setSaveError(geocoderStatusMessage(e.message));
      } else if (e?.response?.status === 403) {
        setSaveError("Création de site non autorisée pour votre compte (rôle requis : admin ou commissionnaire).");
      } else {
        setSaveError(getApiErrorMessage(e, "Impossible d'enregistrer ce lieu. Réessayez ou choisissez une autre suggestion."));
      }
      setSelectedSite(null);
      onChange("");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleClear = () => {
    setSelectedSite(null);
    setInputValue("");
    setSuggestions([]);
    setSaveError("");
    onChange("");
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        fullWidth
        label="Site *"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Tapez au moins 3 caractères, puis choisissez une suggestion dans la liste"
        helperText={
          !placesLib
            ? "Chargement de Google Places…"
            : "La sélection dans la liste est obligatoire (pas seulement du texte libre)."
        }
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: loading || saving
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
          Liaison du lieu à la base…
        </Typography>
      )}

      {saveError && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
          {saveError}
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
