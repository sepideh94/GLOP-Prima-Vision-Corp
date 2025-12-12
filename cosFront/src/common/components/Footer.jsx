import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        py: 2,
        textAlign: "center",
        borderTop: "1px solid #e0e0e0",
        bgcolor: "#ffffff",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2025 CiblOrgaSport — Plateforme de gestion sportive
      </Typography>
    </Box>
  );
}
