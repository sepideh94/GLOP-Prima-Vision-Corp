import { useState, useCallback } from "react";
import {
  GEO_FALLBACK_POSITION,
  GEO_HTTPS_REQUIRED_MESSAGE,
  isGeoFallbackEnabled,
  isInsecureOriginForGeolocation,
} from "../geoFallbackConfig";

export default function useUserGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Résolu à `true` si une position a été obtenue (y compris secours), sinon `false`. */
  const locate = useCallback(() => {
    if (isInsecureOriginForGeolocation()) {
      if (isGeoFallbackEnabled()) {
        setError(null);
        setPosition({ lat: GEO_FALLBACK_POSITION.lat, lng: GEO_FALLBACK_POSITION.lng });
        return Promise.resolve(true);
      }
      setError(GEO_HTTPS_REQUIRED_MESSAGE);
      return Promise.resolve(false);
    }
    if (!navigator.geolocation) {
      if (isGeoFallbackEnabled()) {
        setError(null);
        setPosition({ lat: GEO_FALLBACK_POSITION.lat, lng: GEO_FALLBACK_POSITION.lng });
        return Promise.resolve(true);
      }
      setError("Géolocalisation non supportée par ce navigateur");
      return Promise.resolve(false);
    }
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition({ lat: coords.latitude, lng: coords.longitude });
          setLoading(false);
          resolve(true);
        },
        (err) => {
          const canUseFallback =
            isGeoFallbackEnabled() && (err.code === 2 || err.code === 3);
          if (canUseFallback) {
            setError(null);
            setPosition({ lat: GEO_FALLBACK_POSITION.lat, lng: GEO_FALLBACK_POSITION.lng });
            resolve(true);
          } else if (err.code === 1) {
            setError("Permission refusée. Autorisez la géolocalisation dans les paramètres du navigateur.");
            resolve(false);
          } else {
            setError("Impossible d'obtenir votre position");
            resolve(false);
          }
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  return { position, loading, error, locate };
}
