import { useState, useEffect, useRef, useCallback } from "react";
import athleteLocationService from "../services/athleteLocationService";

const TRACKING_INTERVAL_MS = 30_000;

// Position simulée utilisée uniquement en développement quand le GPS est indisponible
const DEV_FALLBACK_POSITION = { lat: 50.604457, lng: 3.136702 }; // J43P+VG Villeneuve-d'Ascq

export default function useAthleteTracking(athleteId) {
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const sendLocation = useCallback((lat, lng) => {
    if (!athleteId) return;
    athleteLocationService.updateLocation(athleteId, lat, lng).catch(() => {});
  }, [athleteId]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par ce navigateur");
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setTracking(true);
        setPosition({ lat: coords.latitude, lng: coords.longitude });
        sendLocation(coords.latitude, coords.longitude);
      },
      (err) => {
        if (err.code === 2 && import.meta.env.DEV) {
          console.warn("[dev] GPS indisponible, position simulée utilisée (Paris).");
          setTracking(true);
          setPosition(DEV_FALLBACK_POSITION);
          sendLocation(DEV_FALLBACK_POSITION.lat, DEV_FALLBACK_POSITION.lng);
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
