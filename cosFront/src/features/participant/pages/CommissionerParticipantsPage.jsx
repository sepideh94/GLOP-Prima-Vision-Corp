import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";

import appTheme from "../../../common/theme/appTheme";

export default function CommissionerParticipantsPage() {
  const navigate = useNavigate();

  // MOCK participants (à modifier)
  const participants = [
    {
      id: 1,
      firstName: "Leila",
      lastName: "Amrani",
      email: "athlete1@test.com",
      status: "INVITED",
    },
    {
      id: 2,
      firstName: "Yassine",
      lastName: "Benali",
      email: "athlete2@test.com",
      status: "CONFIRMED",
    },
    {
      id: 3,
      firstName: "Sara",
      lastName: "Elfassi",
      email: "athlete3@test.com",
      status: "PENDING",
    },
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <Chip label="Confirmé" color="success" />;
      case "INVITED":
        return <Chip label="Invitation envoyée" color="warning" />;
      case "PENDING":
        return <Chip label="En attente" color="info" />;
      default:
        return <Chip label="Inconnu" />;
    }
  };

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/commissioner")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1.1,
          borderRadius: appTheme.radius.pill,
          background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
          color: appTheme.colors.dark,
        }}
      >
        Retour
      </Button>

      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des participants
        </Typography>
      </Box>

      <div className="card" style={{ borderRadius: 22 }}>
        <div className="card-header">
          <strong>Liste des participants</strong>
        </div>

        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <td><strong>Nom</strong></td>
                <td><strong>Email</strong></td>
                <td><strong>Statut</strong></td>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.firstName} {p.lastName}</td>
                  <td>{p.email}</td>
                  <td>{getStatusChip(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Box>
  );
}
