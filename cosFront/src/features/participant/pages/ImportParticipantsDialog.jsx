import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import commissionerImportService from "../services/commissionerImportService";
import teamService from "../services/teamService";
import appTheme from "../../../common/theme/appTheme";

export default function ImportParticipantsDialog({ open, onClose, competitionId, competitionName }) {

  const [tab, setTab] = useState(0);

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);

  const parseCsv = (selectedFile) => {

    const reader = new FileReader();

    reader.onload = () => {

      const lines = reader.result
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setError("Le fichier CSV est vide ou invalide");
        setPreview([]);
        return;
      }

      const header = lines[0].replace(/\s/g, "");

      if (tab === 0 && header !== "email,firstName,lastName") {
        setError("Format CSV invalide. L'en-tête doit être : email,firstName,lastName");
        setPreview([]);
        return;
      }

      if (tab === 1 && header !== "teamName,firstName,lastName,email") {
        setError("Format CSV invalide. L'en-tête doit être : teamName,firstName,lastName,email");
        setPreview([]);
        return;
      }

      const rows = lines.slice(1).map((line, index) => {

        const values = line.split(",");

        if (tab === 0) {
          const [email, firstName, lastName] = values;

          if (!email || !firstName || !lastName) {
            return {
              email: "—",
              firstName: "Ligne invalide",
              lastName: `#${index + 2}`,
              status: "Erreur",
            };
          }

          return {
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            status: "Invitation à envoyer",
          };
        }

        if (tab === 1) {
          const [teamName, firstName, lastName, email] = values;

          if (!teamName || !firstName || !lastName || !email) {
            return {
              teamName: "—",
              firstName: "Ligne invalide",
              lastName: `#${index + 2}`,
              email: "",
              status: "Erreur",
            };
          }

          return {
            teamName: teamName.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            status: "Invitation à envoyer",
          };
        }

      });

      setError("");
      setPreview(rows);

    };

    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e) => {

    const selectedFile = e.target.files[0];

    setError("");
    setSuccess("");
    setPreview([]);

    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Seuls les fichiers CSV sont acceptés");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (maximum 5 MB)");
      return;
    }

    setFile(selectedFile);
    parseCsv(selectedFile);
  };

  const handleImport = async () => {

    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      if (tab === 0) {

        const response = await commissionerImportService.importAthletesForCompetition(file, competitionId);
        const result = response.data;

        setPreview((prev) =>
          prev.map((p) => ({
            ...p,
            status: "Invitation envoyée",
          }))
        );

        setSuccess(
          `Import terminé : ${result.invited} athlète(s) invité(s), ${result.skipped} ignoré(s)`
        );
      }

      if (tab === 1) {

        await teamService.importTeams(file, competitionId);

        const invited = preview.length;
        const processed = new Set(preview.map(p => p.teamName)).size;

        setPreview((prev) =>
          prev.map((p) => ({
            ...p,
            status: "Invitation envoyée",
          }))
        );

        setSuccess(
          `Import terminé : ${processed} équipe(s) traitée(s), ${invited} athlète(s) invité(s)`
        );
      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Erreur lors de l'import"
      );

    } finally {
      setLoading(false);
    }

  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError("");
    setSuccess("");
    onClose();
  };

  return (

    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-container .MuiDialog-paper": {
          width: "90%",
          maxWidth: "900px",
        },
      }}
    >

      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <GroupAddIcon sx={{ color: appTheme.colors.cyan }} />
        Importer des participants
        {competitionName && (
          <Typography component="span" sx={{ ml: 1, color: "text.secondary", fontWeight: 400 }}>
            - {competitionName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>

        <Tabs
          value={tab}
          onChange={(e,v)=>{setTab(v); setFile(null); setPreview([]); setError(""); setSuccess("");}}
          sx={{ mb:3 }}
        >
          <Tab label="Individuel" />
          <Tab label="Équipe" />
        </Tabs>

        <Typography sx={{ mb: 3, color: "text.secondary" }}>
          {tab === 0
            ? "Importer un CSV contenant les athlètes à inviter."
            : "Importer un CSV contenant les équipes à inviter."}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="label"
            sx={{
              border: "2px dashed #94a3b8",
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              width: "70%",
            }}
          >
            <UploadFileIcon sx={{ fontSize: 50, mb: 1 }} />

            <Typography fontWeight={800}>
              {file ? file.name : "Cliquez pour sélectionner un fichier CSV"}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Taille maximale : 5 MB
            </Typography>

            <input hidden type="file" accept=".csv" onChange={handleFileChange}/>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mt:2 }}>{error}</Alert>}

        {success && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt:2 }}>
            {success}
          </Alert>
        )}

        {preview.length > 0 && (
          <>
            <Divider sx={{ my:3 }}/>

            <Typography fontWeight={800} sx={{ mb:1 }}>
              Aperçu ({preview.length})
            </Typography>

            <Box sx={{ maxHeight:300, overflowY:"auto" }}>
              <table className="table table-sm table-hover">
                <thead>
                  <tr>
                    {tab===1 && <th>Équipe</th>}
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Statut</th>
                  </tr>
                </thead>

                <tbody>

                  {preview.map((p,i)=>(
                    <tr key={i}>

                      {tab===1 && <td>{p.teamName}</td>}

                      <td>{p.firstName} {p.lastName}</td>

                      <td>{p.email}</td>

                      <td>
                        <span
                          style={{
                            padding:"4px 12px",
                            borderRadius:appTheme.radius.pill,
                            fontSize:12,
                            fontWeight:700,
                            background:
                              p.status==="Invitation envoyée"
                                ?"rgba(34,197,94,0.25)"
                                :"rgba(250,204,21,0.25)"
                          }}
                        >
                          {p.status}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </Box>
          </>
        )}

      </DialogContent>

      <DialogActions sx={{p:2,gap:1}}>

        <Button
          onClick={handleClose}
          sx={{
            textTransform:"none",
            fontWeight:700,
            px:3,
            py:1.1,
            borderRadius:appTheme.radius.pill,
            background:"linear-gradient(135deg,#86efac,#4ade80)",
            color:"#064e3b",
          }}
        >
          Fermer
        </Button>

        <Button
          onClick={handleImport}
          disabled={loading || preview.length===0}
          sx={{
            textTransform:"none",
            fontWeight:700,
            px:3,
            py:1.1,
            borderRadius:appTheme.radius.pill,
            background:"linear-gradient(135deg,#22D3EE,#3B82F6)",
            color:appTheme.colors.dark,
          }}
        >

          {loading ? (
            <>
              <CircularProgress size={18} sx={{mr:1}}/>
              Import...
            </>
          ) : (
            "Envoyer les invitations"
          )}

        </Button>

      </DialogActions>

    </Dialog>
  );
}
