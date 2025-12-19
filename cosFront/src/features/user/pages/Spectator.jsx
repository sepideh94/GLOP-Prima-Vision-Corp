import { Box, Typography } from "@mui/material";

export default function Spectator() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Espace Spectateur
      </Typography>

      <Typography>
        Consultez les compétitions et résultats dès qu’ils seront disponibles.
      </Typography>
    </Box>
  );
}
