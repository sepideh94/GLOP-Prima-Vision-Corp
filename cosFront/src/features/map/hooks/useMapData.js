import { useState, useEffect } from "react";
import mapService from "../services/mapService";

export default function useMapData(includeAthletes = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    mapService.getMapData(includeAthletes)
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [includeAthletes]);

  return { data, loading, error };
}
