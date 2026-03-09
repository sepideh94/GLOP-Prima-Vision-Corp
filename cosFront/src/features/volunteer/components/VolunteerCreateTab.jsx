import { Box, TextField, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function VolunteerCreateTab({
  form,
  setForm,
  formErrors,
  error,
  success,
}) {
  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {success && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nom"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          error={!!formErrors.lastName}
          helperText={formErrors.lastName}
          fullWidth
        />

        <TextField
          label="Prénom"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          error={!!formErrors.firstName}
          helperText={formErrors.firstName}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={!!formErrors.email}
          helperText={formErrors.email}
          fullWidth
        />
      </Box>
    </>
  );
}