import { useState, useEffect, useRef, useCallback } from "react";
import athleteLocationService from "../services/athleteLocationService";
import {
  GEO_FALLBACK_POSITION,
  GEO_HTTPS_REQUIRED_MESSAGE,
  isGeoFallbackEnabled,
  isInsecureOriginForGeolocation,
} from "../geoFallbackConfig";

const TRACKING_INTERVAL_MS = 30_000;

export default function useAthleteTracking(athleteId) {
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const sendLocation = useCallback((lat, lng) => {
    if (!athleteId) return;
    athleteLocationService.updateLocation(athleteId, lat, lng).catch(() => {});
  }, [athleteId]);

  const startFallbackInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      sendLocation(GEO_FALLBACK_POSITION.lat, GEO_FALLBACK_POSITION.lng);
    }, TRACKING_INTERVAL_MS);
  }, [sendLocation]);

  const startGpsInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition({ lat: coords.latitude, lng: coords.longitude });
          sendLocation(coords.latitude, coords.longitude);
        },
        () => {}
      );
    }, TRACKING_INTERVAL_MS);
  }, [sendLocation]);

  const startTracking = useCallback(() => {
    if (isInsecureOriginForGeolocation()) {
      if (isGeoFallbackEnabled()) {
        setError(null);
        setTracking(true);
        setPosition({ lat: GEO_FALLBACK_POSITION.lat, lng: GEO_FALLBACK_POSITION.lng });
        sendLocation(GEO_FALLBACK_POSITION.lat, GEO_FALLBACK_POSITION.lng);
        startFallbackInterval();
        return;
      }
      setError(GEO_HTTPS_REQUIRED_MESSAGE);
      return;
    }
    if (!navigator.geolocation) {
      if (isGeoFallbackEnabled()) {
        setError(null);
        setTracking(true);
        setPosition({ lat: GEO_FALLBACK_POSITION.lat, lng: GEO_FALLBACK_POSITION.lng });
        sendLocation(GEO_FALLBACK_POSITION.lat, GEO_FALLBACK_POSITION.lng);
        startFallbackInterval();
        return;
      }
      setError("Géolocalisation non supportée par ce navigateur");
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setTracking(true);
        setPosition({ lat: coords.latitude, lng: coords.longitude });
        sendLocation(coords.latitude, coords.longitude);
        startGpsInterval();
      },
      (err) => {
        // 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT — fréquent en Docker / HTTP non sécurisé / pas de GPS
        const canUseFallback =
          isGeoFallbackEnabled() && (err.code === 2 || err.code === 3);
        if (canUseFallback) {
          console.warn(
            "[geo] GPS indisponible ou expiré, position de secours utilisée (VITE_GEO_FALLBACK ou mode dev)."
          );
          setTracking(true);
          setPosition({ lat: GEO_FALLBACK_POSITION.lat, lng: GEO_FALLBACK_POSITION.lng });
          sendLocation(GEO_FALLBACK_POSITION.lat, GEO_FALLBACK_POSITION.lng);
          startFallbackInterval();
          return;
        }
        if (err.code === 1)
          setError("Permission refusée. Autorisez la géolocalisation dans les paramètres de votre navigateur.");
        else if (err.code === 2)
          setError("Position indisponible. Vérifiez que la géolocalisation est activée sur votre appareil.");
        else
          setError("La récupération de la position a expiré. Réessayez.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [sendLocation, startFallbackInterval, startGpsInterval]);

  const stopTracking = useCallback(() => {
    setTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTracking(), [stopTracking]);

  return { tracking, position, error, startTracking, stopTracking };
}
