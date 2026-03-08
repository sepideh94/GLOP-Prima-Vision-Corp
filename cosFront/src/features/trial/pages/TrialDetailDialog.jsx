import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import appTheme from "../../../common/theme/appTheme";
import trialService from "../services/trialService";

const TRIAL_NAME_OPTIONS = [
  { value: "FIFTY_M_FREESTYLE", label: "50m nage libre" },
  { value: "HUNDRED_M_FREESTYLE", label: "100m nage libre" },
  { value: "TWO_HUNDRED_M_FREESTYLE", label: "200m nage libre" },
  { value: "FOUR_HUNDRED_M_FREESTYLE", label: "400m nage libre" },
  { value: "FIVE_HUNDRED_M_FREESTYLE", label: "500m nage libre" },
  { value: "EIGHT_HUNDRED_M_FREESTYLE", label: "800m nage libre" },
  { value: "FIFTEEN_HUNDRED_M_FREESTYLE", label: "1500m nage libre" },
  { value: "HUNDRED_M_BACKSTROKE", label: "100m dos" },
  { value: "TWO_HUNDRED_M_BACKSTROKE", label: "200m dos" },
  { value: "HUNDRED_M_BREASTSTROKE", label: "100m brasse" },
  { value: "TWO_HUNDRED_M_BREASTSTROKE", label: "200m brasse" },
  { value: "HUNDRED_M_BUTTERFLY", label: "100m papillon" },
  { value: "TWO_HUNDRED_M_BUTTERFLY", label: "200m papillon" },
  { value: "TWO_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "200m 4 nages" },
  { value: "FOUR_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "400m 4 nages" },
  { value: "RELAY_4X100M_FREESTYLE", label: "Relais 4×100m nage libre" },
  { value: "RELAY_4X200M_FREESTYLE", label: "Relais 4×200m nage libre" },
  { value: "RELAY_4X100M_MEDLEY", label: "Relais 4×100m 4 nages" },
];

const MODE_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individuel" },
  { value: "TEAM", label: "Équipe" },
];

const CATEGORY_OPTIONS = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" },
  { value: "MIXTE", label: "Mixte" },
];

const SITE_OPTIONS = [
  { value: 1, label: "Site 1 - Piscine principale" },
  { value: 2, label: "Site 2 - Piscine secondaire" },
];


const getLabelFromEnum = (value, options) => {
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value || "-";
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "-";
  return timeString.substring(0, 5);
};

const DetailRow = ({ label, value }) => (
  <Box sx={{ display: "flex", py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
    <Typography sx={{ fontWeight: 600, minWidth: 180, color: "#555" }}>
      {label}
    </Typography>
    <Typography sx={{ flex: 1 }}>{value || "-"}</Typography>
  </Box>
);

export default function TrialDetailDialog({ open, onClose, trial, competition }) {
  const [tab, setTab] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(0);
      setParticipants([]);
    }
  }, [open]);

  useEffect(() => {
    if (open && trial?.id) {
      setLoadingParticipants(true);
      trialService.getTrialAthletes(trial.id)
        .then(setParticipants)
        .catch(() => setParticipants([]))
        .finally(() => setLoadingParticipants(false));
    }
  }, [open, trial?.id]);

  if (!trial) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          "& .MuiDialog-paper": {
            width: "90%",
            maxWidth: "900px",
          },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EmojiEventsIcon sx={{ color: appTheme.colors.cyan }} />
        Détails de l'épreuve
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2, borderBottom: "1px solid #e0e0e0" }}
        >
          <Tab label="Informations" />
          <Tab label={`Participants (${participants.length})`} />
        </Tabs>

        {tab === 0 && <Box sx={{ mt: 1 }}>
          {competition && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(34, 211, 238, 0.1)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: appTheme.colors.cyan }}>
                Compétition : {competition.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 3 }}>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  <strong>Début :</strong> {formatDate(competition.startDate)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  <strong>Fin :</strong> {formatDate(competition.endDate)}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DetailRow label="Type d'épreuve" value={getLabelFromEnum(trial.trialName, TRIAL_NAME_OPTIONS)} />
              <DetailRow label="Mode" value={getLabelFromEnum(trial.mode, MODE_OPTIONS)} />
              <DetailRow label="Catégorie" value={getLabelFromEnum(trial.categoryGender, CATEGORY_OPTIONS)} />
              <DetailRow label="Site" value={getLabelFromEnum(trial.siteId, SITE_OPTIONS)} />
              <DetailRow label="Round" value={trial.roundDisplayName || "-"} />
            </Grid>
            <Grid item xs={12} md={6}>
              <DetailRow label="Date" value={formatDate(trial.startDate)} />
              <DetailRow label="Heure de début" value={formatTime(trial.startHour)} />
              <DetailRow label="Heure de fin" value={formatTime(trial.endHour)} />
              <DetailRow label="Numéro de série" value={trial.roundNumber || "-"} />
              <DetailRow label="Statut" value={trial.statusLabel} />
            </Grid>
          </Grid>

          {(trial.description || trial.rules) && (
            <>
              <Divider sx={{ my: 2 }} />
              {trial.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: "#555", mb: 1 }}>Description</Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>{trial.description}</Typography>
                </Box>
              )}
              {trial.rules && (
                <Box>
                  <Typography sx={{ fontWeight: 600, color: "#555", mb: 1 }}>Règles</Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>{trial.rules}</Typography>
                </Box>
              )}
            </>
          )}
        </Box>}

        {tab === 1 && (
          <Box sx={{ mt: 1 }}>
            {loadingParticipants ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : participants.length === 0 ? (
              <Typography sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
                Aucun participant assigné à cette épreuve.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Prénom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participants.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{p.athleteLastName}</TableCell>
                      <TableCell>{p.athleteFirstName}</TableCell>
                      <TableCell>{p.athleteEmail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
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
            background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
