import { useEffect, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import CompetitionCard from "../components/CompetitionCard";
import ConfirmParticipationModal from "../components/ConfirmParticipationModal";
import athleteCompetitionService from "../services/athleteCompetitionService";

export default function AthleteCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    athleteCompetitionService.getMyCompetitions().then((data) => {
      setCompetitions(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Typography>Chargement…</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontSize: 36, fontWeight: 900, mb: 1 }}>
        Participation
      </Typography>

      <Typography sx={{ fontSize: 15, color: "#374151", mb: 6 }}>
        Retrouvez ici les compétitions auxquelles vous êtes invité(e) et confirmez votre participation si nécessaire.
      </Typography>

      <Grid container spacing={4}>
        {competitions.map((competition) => (
          <Grid key={competition.participationId} item xs={12} md={4}>
            <CompetitionCard
              competition={competition}
              onConfirm={setSelectedCompetition}
            />
          </Grid>
        ))}
      </Grid>

      {selectedCompetition && (
        <ConfirmParticipationModal
          open
          competition={selectedCompetition}
          onClose={() => setSelectedCompetition(null)}
          onConfirm={() => {
            athleteCompetitionService
              .confirmParticipation(selectedCompetition.participationId) 
              .then(() => {
                setCompetitions((prev) =>
                  prev.map((c) =>
                    c.participationId === selectedCompetition.participationId
                      ? { ...c, status: "CONFIRMED" }
                      : c
                  )
                );
                setSelectedCompetition(null);
              });
          }}
        />
      )}
    </Box>
  );
}
