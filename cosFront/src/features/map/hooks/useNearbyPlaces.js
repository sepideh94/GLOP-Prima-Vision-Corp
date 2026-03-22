import { useState, useCallback } from "react";
import mapService from "../services/mapService";
import fanZoneService from "../services/fanZoneService";
import { distanceKm } from "../geoDistance";

/**
 * @param {{ includeAdminAthleteLocations?: boolean }} options
 * Si `includeAdminAthleteLocations`, appelle l’API admin (positions + noms) et filtre par rayon.
 */
export default function useNearbyPlaces(options = {}) {
  const includeAdminAthleteLocations = options.includeAdminAthleteLocations === true;

  const [trials, setTrials] = useState([]);
  const [fanZones, setFanZones] = useState([]);
  const [trackedAthletes, setTrackedAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchEpoch, setSearchEpoch] = useState(0);

  const search = useCallback(
    async (lat, lng, radiusKm = 10) => {
      setLoading(true);
      setError(null);
      try {
        const promises = [
          mapService.getNearbyTrials(lat, lng, radiusKm),
          fanZoneService.getNearby(lat, lng, radiusKm),
        ];
        if (includeAdminAthleteLocations) {
          promises.push(mapService.getAdminAthleteLocations());
        }
        const results = await Promise.all(promises);
        const t = results[0];
        const fz = results[1];
        const adminRaw = includeAdminAthleteLocations ? results[2] : null;

        const list = Array.isArray(t) ? t : [];
        setTrials(
          list.map((row) => ({
            id: row.trialId ?? row.id,
            name: row.trialName ?? row.name,
            siteLatitude: row.latitude ?? row.siteLatitude,
            siteLongitude: row.longitude ?? row.siteLongitude,
            startDate: row.startDate,
            startHour: row.startHour,
          }))
        );
        setFanZones(Array.isArray(fz) ? fz : []);

        if (includeAdminAthleteLocations) {
          const athletesList = Array.isArray(adminRaw) ? adminRaw : [];
          setTrackedAthletes(
            athletesList.filter(
              (a) =>
                a.latitude != null &&
                a.longitude != null &&
                distanceKm(lat, lng, a.latitude, a.longitude) <= radiusKm
            )
          );
        } else {
          setTrackedAthletes([]);
        }
        setSearchEpoch((n) => n + 1);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [includeAdminAthleteLocations]
  );

  return { trials, fanZones, trackedAthletes, loading, error, search, searchEpoch };
}
