import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

import appTheme from "../../../common/theme/appTheme";

import useVolunteerImport from "../hooks/useVolunteerImport";
import VolunteerImportTab from "./VolunteerImportTab";
import VolunteerPreviewTable from "./VolunteerPreviewTable";
import VolunteerCreateTab from "./VolunteerCreateTab";

import volunteerService from "../services/volunteerService";
import { isValidEmail } from "../utils/emailValidation";

export default function VolunteerManagementDialog({
  open,
  onClose,
  competitionId,
  competitionName,
}) {
  const [tab, setTab] = useState(0);

  /* ---------------- IMPORT CSV ---------------- */

  const {
    file,
    preview,
    loading,
    error: importError,
    success: importSuccess,
    handleFile,
    sendInvitations,
  } = useVolunteerImport(competitionId);

  /* ---------------- CREATE VOLUNTEER ---------------- */

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const validateForm = () => {
    const errors = {};

    if (!form.lastName.trim()) {
      errors.lastName = "Le nom est obligatoire";
    }

    if (!form.firstName.trim()) {
      errors.firstName = "Le prénom est obligatoire";
    }

    if (!form.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!isValidEmail(form.email)) {
      errors.email = "Format d'email invalide";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    setCreateError("");
    setCreateSuccess("");

    if (!validateForm()) return;

    try {
      await volunteerService.createVolunteer(competitionId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      });

      setCreateSuccess(
        "Le volontaire a été créé. Une invitation lui a été envoyée par mail !"
      );

      setForm({
        firstName: "",
        lastName: "",
        email: "",
      });

      setFormErrors({});
    } catch (err) {
      setCreateError(
        err.response?.data?.message ||
          "Erreur lors de la création du volontaire"
      );
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Gestion des volontaires {competitionName && `- ${competitionName}`}
      </DialogTitle>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
        <Tab icon={<UploadFileIcon />} label="Importer" iconPosition="start" />
        <Tab
          icon={<VolunteerActivismIcon />}
          label="Créer un volontaire"
          iconPosition="start"
        />
      </Tabs>

      <DialogContent dividers>
        {tab === 0 && (
          <VolunteerImportTab
            file={file}
            preview={preview}
            error={importError}
            success={importSuccess}
            onFileChange={(e) => handleFile(e.target.files?.[0])}
            PreviewTable={VolunteerPreviewTable}
          />
        )}

        {tab === 1 && (
          <VolunteerCreateTab
            form={form}
            setForm={setForm}
            formErrors={formErrors}
            error={createError}
            success={createSuccess}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #86efac, #4ade80)",
            color: "#064e3b",
          }}
        >
          Fermer
        </Button>

        {tab === 0 && (
          <Button
            onClick={sendInvitations}
            disabled={loading || preview.length === 0}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Envoi...
              </>
            ) : (
              "Envoyer les invitations"
            )}
          </Button>
        )}

        {tab === 1 && (
          <Button
            onClick={handleCreate}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
          >
            Créer le volontaire
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}