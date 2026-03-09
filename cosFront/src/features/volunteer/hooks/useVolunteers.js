import { useState, useCallback } from "react";
import volunteerService from "../services/volunteerService";
import competitionService from "../../competition/services/competitionService";

export default function useVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCompetitions = useCallback(async () => {
    try {
      const events = await competitionService.getEvents();

      const competitionsResults = await Promise.all(
        events.map((e) =>
          competitionService.getCompetitionsByEvent(e.id)
        )
      );

      setCompetitions(competitionsResults.flat());
    } catch (err) {
      console.error("Erreur compétitions", err);
    }
  }, []);

  const loadVolunteers = useCallback(async (competitionId, competitions) => {
    setLoading(true);
    setError(null);

    try {
      let volunteersData = [];

      if (competitionId) {
        volunteersData =
          await volunteerService.getVolunteersByCompetition(competitionId);
      } else {
        const results = await Promise.all(
          competitions.map((c) =>
            volunteerService.getVolunteersByCompetition(c.id)
          )
        );

        const unique = new Map();

        results.flat().forEach((v) => {
          unique.set(v.id, v);
        });

        volunteersData = Array.from(unique.values());
      }

      setVolunteers(volunteersData);
    } catch (err) {
      console.error("Erreur volontaires", err);
      setError("Impossible de charger les volontaires");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    volunteers,
    competitions,
    loading,
    error,
    loadCompetitions,
    loadVolunteers,
  };
}