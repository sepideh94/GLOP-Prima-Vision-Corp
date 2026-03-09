import {
  Box,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function VolunteerImportTab({
  file,
  error,
  success,
  preview,
  onFileChange,
  PreviewTable,
}) {
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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

          <Typography variant="caption">
            Taille maximale : 5 MB
          </Typography>

          <input hidden type="file" accept=".csv" onChange={onFileChange} />
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {preview.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <PreviewTable preview={preview} />
        </>
      )}
    </>
  );
}