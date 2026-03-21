import { useState, useEffect, useRef, useCallback } from "react";
import athleteLocationService from "../services/athleteLocationService";

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

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée");
      return;
    }
    setTracking(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lng: coords.longitude });
        sendLocation(coords.latitude, coords.longitude);
      },
      () => setError("Impossible d'obtenir la position")
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
