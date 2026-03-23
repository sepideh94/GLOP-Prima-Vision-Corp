import { useState, useEffect } from "react";
import athleteLocationService from "../services/athleteLocationService";
import { DEV_MEETING_POINTS } from "../devMocks";

export default function useMeetingInfo(athleteId) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error] = useState(null);

  useEffect(() => {
    if (!athleteId) return;
    let cancelled = false;
    setLoading(true);
    athleteLocationService.getMeetingInfo(athleteId)
      .then((d) => { if (!cancelled) { setInfo(d); setLoading(false); } })
      .catch(() => {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            console.warn("[dev] Backend inaccessible — meeting points simulés.");
            setInfo(DEV_MEETING_POINTS);
          }
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [athleteId]);

  return { info, loading, error };
}
