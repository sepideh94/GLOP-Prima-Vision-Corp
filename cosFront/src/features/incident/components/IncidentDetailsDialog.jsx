import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";

import { useEffect, useState } from "react";

import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import appTheme from "../../../common/theme/appTheme";

import trialService from "../../trial/services/trialService";

const impactLabels = {
  TOUS: "Tous",
  COMMISSIONNER: "Commissaires",
  ATHLETE: "Athlètes",
  VOLONTEER: "Volontaires",
  SPECTATOR: "Spectateurs",
};

const statusLabels = {
  EN_COURS: "En cours",
  RESOLU: "Résolu",
};

const siteLabels = {
  1: "Piscine principale",
  2: "Piscine secondaire",
};

const getStatusColor = (status) => {
  switch (status) {
    case "EN_COURS":
      return "#facc15";
    case "RESOLU":
      return "#22c55e";
    default:
      return "#64748b";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DetailRow = ({ label, value }) => (
  <Box sx={{ display: "flex", py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
    <Typography sx={{ fontWeight: 600, minWidth: 150, color: "#555" }}>
      {label}
    </Typography>

    <Typography sx={{ flex: 1 }}>
      {value || "-"}
    </Typography>
  </Box>
);

export default function IncidentDetailsDialog({
  open,
  onClose,
  incident,
  getCompetitionName,
  getEventName,
}) {

  const [trials, setTrials] = useState([]);

  useEffect(() => {

    const loadTrials = async () => {

      if (!incident?.competitionId) return;

      try {

        const data = await trialService.getTrialsByCompetition(
          incident.competitionId
        );

        setTrials(data || []);

      } catch (err) {
        console.error(err);
      }

    };

    loadTrials();

  }, [incident]);

  const getTrialName = (id) => {
    const trial = trials.find((t) => t.id === id);
    return trial ? trial.name : id;
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ReportProblemIcon sx={{ color: appTheme.colors.cyan }} />
        Détails de l'incident
      </DialogTitle>

      <DialogContent>

        <Box sx={{ mt: 1 }}>

          {/* INCIDENT BOX */}

          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: "rgba(34, 211, 238, 0.1)",
              border: "1px solid rgba(34, 211, 238, 0.3)",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                color: appTheme.colors.cyan,
              }}
            >
              Incident : {incident.title}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <DetailRow
            label="Instructions"
            value={incident.description}
          />

          <DetailRow
            label="Impact"
            value={impactLabels[incident.impactLevel]}
          />

          <DetailRow
            label="Statut"
            value={
              <Box
                sx={{
                  display: "inline-block",
                  background: getStatusColor(incident.status),
                  color: "#fff",
                  px: 1.5,
                  py: 0.4,
                  borderRadius: "10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {statusLabels[incident.status]}
              </Box>
            }
          />

          {/* EVENT avant compétition */}

          <DetailRow
            label="Événement"
            value={getEventName?.(incident.eventId)}
          />

          <DetailRow
            label="Compétition"
            value={
              incident.competitionId
                ? getCompetitionName(incident.competitionId)
                : "-"
            }
          />

          <DetailRow
            label="Épreuve"
            value={incident.trialId ? getTrialName(incident.trialId) : "-"}
          />

          <DetailRow
            label="Site"
            value={
              incident.siteId
                ? siteLabels[incident.siteId] || incident.siteId
                : "-"
            }
          />

          <DetailRow
            label="Créé le"
            value={formatDateTime(incident.createdAt)}
          />

        </Box>

      </DialogContent>

      <DialogActions>

        <Button
          onClick={onClose}
          sx={{
            mb: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            minWidth: 130,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg,#22D3EE,#3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          Fermer
        </Button>

      </DialogActions>

    </Dialog>
  );
}