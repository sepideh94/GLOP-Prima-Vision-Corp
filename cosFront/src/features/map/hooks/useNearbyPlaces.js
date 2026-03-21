import { useState, useCallback } from "react";
import mapService from "../services/mapService";
import fanZoneService from "../services/fanZoneService";

export default function useNearbyPlaces() {
  const [trials, setTrials] = useState([]);
  const [fanZones, setFanZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (lat, lng, radiusKm = 10) => {
    setLoading(true);
    setError(null);
    try {
      const [t, fz] = await Promise.all([
        mapService.getNearbyTrials(lat, lng, radiusKm),
        fanZoneService.getNearby(lat, lng, radiusKm),
      ]);
      setTrials(t);
      setFanZones(fz);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { trials, fanZones, loading, error, search };
}
