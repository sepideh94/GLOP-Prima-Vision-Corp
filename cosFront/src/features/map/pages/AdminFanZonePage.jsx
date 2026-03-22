import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPageLayout from "../../../common/components/AdminPageLayout";
import RichTextEditor from "../../../common/components/RichTextEditor";
import FanZoneLocationPicker from "../components/FanZoneLocationPicker";
import fanZoneService from "../services/fanZoneService";

const FAN_ZONE_TYPES = [
  { value: "PUBLIC_VIEWING", label: "Public Viewing" },
  { value: "BAR", label: "Bar" },
  { value: "EVENT_SPACE", label: "Espace événementiel" },
];

const TYPE_COLORS = {
  PUBLIC_VIEWING: "info",
  BAR: "warning",
  EVENT_SPACE: "success",
};

const EMPTY_FORM = {
  name: "", location: null, capacity: "", type: "PUBLIC_VIEWING", description: "",
};

export default function AdminFanZonePage() {
  const [fanZones, setFanZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fanZoneService.getAll();
      setFanZones(data);
    } catch {
      setError("Impossible de charger les fan zones.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await fanZoneService.create({
        name: form.name,
        address: form.location?.address ?? "",
        latitude: form.location?.latitude ?? 0,
        longitude: form.location?.longitude ?? 0,
        capacity: form.capacity ? Number.parseInt(form.capacity, 10) : null,
        type: form.type,
        description: form.description,
      });
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      setFormError("Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fanZoneService.delete(id);
      setFanZones((prev) => prev.filter((fz) => fz.id !== id));
    } catch {
      setError("Impossible de supprimer cette fan zone.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <AdminPageLayout title="Gestion des Fan Zones" backPath="/admin">
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Créer une fan zone
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Nom</strong></TableCell>
                <TableCell><strong>Adresse</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Capacité</strong></TableCell>
                <TableCell><strong>Coordonnées</strong></TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fanZones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Aucune fan zone créée
                  </TableCell>
                </TableRow>
              ) : fanZones.map((fz) => (
                <TableRow key={fz.id} hover>
                  <TableCell>{fz.name}</TableCell>
                  <TableCell>{fz.address}</TableCell>
                  <TableCell>
                    <Chip
                      label={FAN_ZONE_TYPES.find((t) => t.value === fz.type)?.label ?? fz.type}
                      color={TYPE_COLORS[fz.type] ?? "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{fz.capacity ?? "—"}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                    {fz.latitude.toFixed(4)}, {fz.longitude.toFixed(4)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => setDeleteId(fz.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog création */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Nouvelle fan zone</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField label="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
          <FanZoneLocationPicker
            value={form.location}
            onChange={(loc) => setForm({ ...form, location: loc })}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select label="Type *" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })} fullWidth
            >
              {FAN_ZONE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField label="Capacité" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} fullWidth />
          </Box>
          <RichTextEditor
            value={form.description}
            onChange={(html) => setForm({ ...form, description: html })}
            placeholder="Description de la fan zone..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateOpen(false); setForm(EMPTY_FORM); }}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name || !form.location}>
            {saving ? <CircularProgress size={18} /> : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Supprimer cette fan zone ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteId)}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageLayout>
  );
}
