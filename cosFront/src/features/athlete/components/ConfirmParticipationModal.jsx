import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArticleIcon from "@mui/icons-material/Article";

export default function ConfirmParticipationModal({
  open,
  onClose,
  onConfirm,
  competition,
}) {
  const [accepted, setAccepted] = useState(false);

  const handleConfirm = () => {
    if (!accepted) return;
    onConfirm();
    setAccepted(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          borderRadius: 4,
        },
      }}
    >
      {/* ===== HEADER ===== */}
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography fontSize={24} fontWeight={900}>
              Valider l'inscription
            </Typography>
            <Typography fontSize={14} color="text.secondary">
              {competition?.eventName}
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* ===== CONTENT ===== */}
      <DialogContent sx={{ pt: 3 }}>
        {/* Titre charte */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.2}
          mb={2}
          sx={{
            backgroundColor: "#f1f5f9",
            px: 2,
            py: 1.2,
            borderRadius: 2,
          }}
        >
          <ArticleIcon color="primary" />
          <Typography fontWeight={800} fontSize={16}>
            Charte Européenne du Sport
          </Typography>
        </Box>

        {/* Bloc charte */}
        <Box
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 3,
            p: 3,
            height: 300,
            overflowY: "auto",
            mb: 3,
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography fontWeight={900} mb={2}>
            CHARTE EUROPÉENNE DU SPORT
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>Article 1 – Objectif de la Charte</strong><br />
            Les gouvernements, en vue de la promotion du sport en tant que facteur
            important du développement humain, prennent les mesures nécessaires
            pour donner effet aux dispositions de la présente Charte conformément
            aux principes énoncés dans le Code d'éthique sportive.
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>Article 2 – Définition et champ d'application</strong><br />
            On entend par « sport » toutes formes d'activités physiques qui, à
            travers une participation organisée ou non, ont pour objectif
            l'expression ou l'amélioration de la condition physique et psychique,
            le développement des relations sociales ou l'obtention de résultats
            en compétition.
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>Article 3 – Le rôle des pouvoirs publics</strong><br />
            Les pouvoirs publics encouragent la pratique du sport pour tous,
            garantissent l’égalité d’accès, luttent contre le dopage et assurent la
            protection de l’intégrité morale et physique des sportifs.
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>Article 4 – Éthique et fair-play</strong><br />
            La pratique sportive repose sur le respect des règles, des
            adversaires, des officiels et de l’esprit sportif. Toute forme de
            tricherie, de violence ou de discrimination est strictement
            proscrite.
          </Typography>

          <Typography variant="body2">
            <strong>Article 5 – Protection des données</strong><br />
            Les participants reconnaissent que leurs données personnelles peuvent
            être utilisées dans le cadre de l’organisation des compétitions,
            conformément aux réglementations en vigueur (RGPD).
          </Typography>
        </Box>

        {/* Checkbox */}
        <Box
          sx={{
            backgroundColor: "#f1f5f9",
            borderRadius: 2,
            px: 2,
            py: 1.5,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            }
            label={
              <Typography fontSize={14}>
                J’ai lu et j’accepte la charte européenne du sport ainsi que le
                règlement de la compétition.
              </Typography>
            }
          />
        </Box>
      </DialogContent>

      {/* ===== ACTIONS ===== */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            backgroundColor: "#2563eb",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#1d4ed8",
            },
          }}
        >
          Annuler
        </Button>

        <Button
          variant="contained"
          color="success"
          disabled={!accepted}
          onClick={handleConfirm}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            px: 4,
          }}
        >
          Valider ma participation
        </Button>
      </DialogActions>
    </Dialog>
  );
}
