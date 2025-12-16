import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        py: 2,
        textAlign: "center",
        background: "#ECFDF5",
        borderTop: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="body2" sx={{ color: "#64748B" }}>
        © 2025 CiblOrgaSport — Plateforme de gestion sportive
      </Typography>
    </Box>
  );
}
