import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import appTheme from "../theme/appTheme";

export default function Layout() {
  const location = useLocation();
  const isSpectatorArea = location.pathname.startsWith("/spectator");

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
      <Navbar />

      <Box sx={{ display: "flex", flex: 1, mt: "64px" }}>
        {!isSpectatorArea && <Sidebar />}

        <Box
          component="main"
          sx={{ flex: 1, px: isSpectatorArea ? 3 : 6, py: 5 }}
        >
          <Outlet />
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}