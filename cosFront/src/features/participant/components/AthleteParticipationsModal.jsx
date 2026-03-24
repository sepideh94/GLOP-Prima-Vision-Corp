import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import athleteService from "../services/athleteService";
import appTheme from "../../../common/theme/appTheme";

const getStatusChip = (status) => {
  switch (status) {
    case "CONFIRMED":
      return <Chip label="Confirmé" color="success" size="small" />;
    case "INVITED":
      return <Chip label="Invité" color="warning" size="small" />;
    case "PENDING":
      return <Chip label="En attente" color="info" size="small" />;
    case "PENDING_VALIDATION":
      return <Chip label="En attente de validation" color="warning" size="small" />;
    case "CANCELED":
      return <Chip label="Annulé" color="error" size="small" />;
    default:
      return <Chip label={status || "Inconnu"} size="small" />;
  }
};

/**
 * Liste en lecture seule des participations.
 * La validation et la visualisation des documents se font sur CommissionerParticipantsPage.
 */
export default function AthleteParticipationsModal({ open, onClose, athlete }) {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && athlete) {
      fetchParticipations();
    }
  }, [open, athlete]);

  const fetchParticipations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await athleteService.getAthleteParticipations(athlete.id);
      setParticipations(data);
    } catch (err) {
      console.error("Erreur lors du chargement des participations:", err);
      setError("Impossible de charger les participations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Participations de {athlete?.firstName} {athlete?.lastName}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : participations.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
            Aucune participation trouvée pour cet athlète.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Compétition</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Statut</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participations.map((p) => (
                  <TableRow key={p.participationId}>
                    <TableCell>{p.competitionName}</TableCell>
                    <TableCell>{getStatusChip(p.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #86efac, #4ade80)",
            color: "#064e3b",
            boxShadow: "0 4px 12px rgba(74,222,128,0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
            },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
