import { useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import CompetitionCard from "../components/CompetitionCard";
import ConfirmParticipationModal from "../components/ConfirmParticipationModal";

const initialCompetitions = [
  {
    id: 1,
    eventName: "NOM EVENT 1",
    competitionName: "Nom de la compétition 1",
    date: "15-16 JUIN 2024",
    location: "Stade Charléty, Paris",
    status: "INVITED",
  },
  {
    id: 2,
    eventName: "NOM EVENT 1",
    competitionName: "Nom de la compétition 2",
    date: "22 SEPT 2024",
    location: "Clermont-Ferrand",
    status: "CONFIRMED",
  },
  {
    id: 3,
    eventName: "NOM EVENT 3",
    competitionName: "Nom de la compétition 3",
    date: "05 OCT 2024",
    location: "Lille",
    status: "FINISHED",
  },
];

export default function AthleteCompetitionsPage() {
  const [competitions, setCompetitions] = useState(initialCompetitions);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontSize: 36, fontWeight: 900, mb: 1 }}>
        Participation
      </Typography>

      <Typography sx={{ fontSize: 15, color: "#374151", mb: 6, maxWidth: 900 }}>
        Retrouvez ici les compétitions auxquelles vous êtes invité(e) et confirmez
        votre participation si nécessaire.
      </Typography>

      <Grid container spacing={4} alignItems="stretch">
        {competitions.map((competition) => (
          <Grid
            key={competition.id}
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
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
            setCompetitions((prev) =>
              prev.map((c) =>
                c.id === selectedCompetition.id
                  ? { ...c, status: "CONFIRMED" }
                  : c
              )
            );
            setSelectedCompetition(null);
          }}
        />
      )}
    </Box>
  );
}
