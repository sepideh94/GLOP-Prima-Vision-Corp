import { useState, useCallback } from "react";

export default function useUserGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par ce navigateur");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lng: coords.longitude });
        setLoading(false);
      },
      () => {
        setError("Impossible d'obtenir votre position");
        setLoading(false);
      }
    );
  }, []);

  return { position, loading, error, locate };
}
