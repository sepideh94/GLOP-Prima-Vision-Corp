import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

function inferKind(contentType = "", filename = "") {
  const ct = String(contentType).toLowerCase();
  const name = String(filename).toLowerCase();
  if (ct.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (ct.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/.test(name)) return "image";
  return "other";
}

export default function UploadedFilePreviewModal({
  open,
  onClose,
  title = "Visualisation du fichier",
  fileBlob = null,
  fileUrl = "",
  fileName = "",
  contentType = "",
  loading = false,
  error = "",
}) {
  const objectUrl = useMemo(() => {
    if (!fileBlob) return "";
    return URL.createObjectURL(fileBlob);
  }, [fileBlob]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewUrl = objectUrl || fileUrl || "";
  const fileKind = inferKind(contentType || fileBlob?.type || "", fileName);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !previewUrl ? (
          <Alert severity="info">Aucun fichier à afficher.</Alert>
        ) : fileKind === "image" ? (
          <Box sx={{ display: "flex", justifyContent: "center", bgcolor: "#f8fafc", p: 1.5, borderRadius: 2 }}>
            <Box
              component="img"
              src={previewUrl}
              alt={fileName || "Aperçu du fichier"}
              sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 1 }}
            />
          </Box>
        ) : fileKind === "pdf" ? (
          <Box sx={{ height: "70vh", border: "1px solid rgba(148,163,184,0.35)", borderRadius: 2, overflow: "hidden" }}>
            <Box
              component="iframe"
              title={fileName || "Aperçu PDF"}
              src={previewUrl}
              sx={{ width: "100%", height: "100%", border: "none", bgcolor: "#fff" }}
            />
          </Box>
        ) : (
          <Alert severity="info">
            Prévisualisation non prise en charge pour ce type de fichier.
          </Alert>
        )}

        {!!fileName && (
          <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: 13 }}>
            {fileName}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
