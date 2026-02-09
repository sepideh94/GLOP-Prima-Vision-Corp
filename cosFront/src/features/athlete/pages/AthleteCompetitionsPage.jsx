import { useEffect, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import CompetitionCard from "../components/CompetitionCard";
import ConfirmParticipationModal from "../components/ConfirmParticipationModal";
import IncompleteProfileModal from "../components/IncompleteProfileModal";
import athleteCompetitionService from "../services/athleteCompetitionService";
import athleteProfileService from "../services/athleteProfileService";
import { useAuth } from "../../../common/contexts/AuthContext";

export default function AthleteCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    athleteCompetitionService.getMyCompetitions().then((data) => {
      setCompetitions(data);
      setLoading(false);
    });
    loadProfile();
  }, []);

  // Recharger le profil quand la page redevient visible (après retour du profil)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProfile();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", loadProfile);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadProfile);
    };
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await athleteProfileService.getMyProfile();
      setUserProfile(profile);
    } catch (err) {
      // Profil non trouvé
      setUserProfile(null);
    }
  };

  const isProfileComplete = () => {
    // Vérifier d'abord dans userProfile (depuis l'API)
    if (userProfile) {
      return (
        userProfile.nationality &&
        userProfile.birthDate &&
        userProfile.sexe &&
        userProfile.passportNumber &&
        userProfile.hasPassport &&
        userProfile.hasMedicalCertificate
      );
    }
    // Sinon vérifier dans l'objet user depuis AuthContext
    if (user) {
      return (
        user.nationality &&
        user.dateOfBirth &&
        user.gender &&
        user.passportNumber &&
        user.passportFile &&
        user.medicalCertificateFile
      );
    }
    return false;
  };

  const handleConfirmClick = (competition) => {
    if (!isProfileComplete()) {
      setShowIncompleteProfileModal(true);
      return;
    }
    setSelectedCompetition(competition);
  };

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
              onConfirm={handleConfirmClick}
              isProfileComplete={isProfileComplete()}
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

      <IncompleteProfileModal
        open={showIncompleteProfileModal}
        onClose={() => {
          setShowIncompleteProfileModal(false);
          loadProfile(); // Recharger le profil après fermeture de la modale
        }}
      />
    </Box>
  );
}
