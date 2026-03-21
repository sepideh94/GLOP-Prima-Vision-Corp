import { useState, useEffect } from "react";
import athleteLocationService from "../services/athleteLocationService";

export default function useMeetingInfo(athleteId) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!athleteId) return;
    let cancelled = false;
    setLoading(true);
    athleteLocationService.getMeetingInfo(athleteId)
      .then((d) => { if (!cancelled) { setInfo(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [athleteId]);

  return { info, loading, error };
}
