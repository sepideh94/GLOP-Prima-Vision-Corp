import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import appTheme from "../theme/appTheme";

export default function PublicLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: appTheme.typography.fontFamily,
        background: appTheme.gradients.page,
      }}
    >
      <PublicNavbar />
      <Box component="main" sx={{ flex: 1, mt: "64px" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
