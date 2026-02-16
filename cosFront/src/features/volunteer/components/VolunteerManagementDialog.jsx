import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Divider,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

import appTheme from "../../../common/theme/appTheme";

export default function VolunteerManagementDialog({
  open,
  onClose,
  competitionId,
  competitionName,
}) {
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    if (!form.firstName || !form.lastName || !form.email) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    console.log("Créer volontaire:", form);

    setSuccess("Volontaire créé avec succès");
    setForm({ firstName: "", lastName: "", email: "" });
  };

  const handleClose = () => {
    setTab(0);
    setForm({ firstName: "", lastName: "", email: "" });
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        Gestion des volontaires
        {competitionName && (
          <Typography
            component="span"
            sx={{ ml: 1, fontWeight: 400, color: "text.secondary" }}
          >
            - {competitionName}
          </Typography>
        )}
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        centered
        sx={{
          mb: 2,
        }}
      >
        <Tab
          icon={<UploadFileIcon />}
          label="Importer"
          iconPosition="start"
        />
        <Tab
          icon={<VolunteerActivismIcon />}
          label="Créer un volontaire"
          iconPosition="start"
        />
      </Tabs>

      <DialogContent dividers>

        {tab === 0 && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <UploadFileIcon sx={{ fontSize: 60, mb: 2, color: appTheme.colors.cyan }} />

            <Typography fontWeight={800} mb={1}>
              Importer des volontaires via CSV
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              Le fichier doit contenir : email,firstName,lastName
            </Typography>

            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: appTheme.radius.pill,
                background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
                color: appTheme.colors.dark,
              }}
            >
              Sélectionner un fichier
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              label="Nom"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Prénom"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
            />

            <Divider sx={{ my: 1 }} />

            <Button
              onClick={handleCreate}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                py: 1.2,
                borderRadius: appTheme.radius.pill,
                background: "linear-gradient(135deg, #facc15, #22c55e)",
                color: appTheme.colors.dark,
                "&:hover": {
                  background: "linear-gradient(135deg, #eab308, #16a34a)",
                },
              }}
            >
              Créer le volontaire
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
