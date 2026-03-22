import { useState, useEffect } from "react";
import mapService from "../services/mapService";

export default function useMapData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    mapService.getMapData()
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
