import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        py: 2,
        textAlign: "center",
        background: "#E2E8F0", 
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        sx={{
          color: "#475569",
          fontSize: 13,
        }}
      >
        © 2025 CiblOrgaSport — Plateforme de gestion sportive
      </Typography>
    </Box>
  );
}
