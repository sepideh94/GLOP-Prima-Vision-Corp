import { useEffect, useState, useCallback } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import appTheme from "../theme/appTheme";
import { ATHLETE_PLANNING_ACCESS_DENIED_EVENT } from "../api/axiosInstance";

export default function Layout() {
  const location = useLocation();
  const isSpectatorArea = location.pathname.startsWith("/spectator");
  const [athleteAccessDenied, setAthleteAccessDenied] = useState({ open: false, message: "" });

  const handleAthleteAccessDenied = useCallback((event) => {
    const message = event?.detail?.message || "";
    if (!message) return;
    setAthleteAccessDenied({ open: true, message });
  }, []);

  const closeAthleteAccessDenied = useCallback(() => {
    setAthleteAccessDenied((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    window.addEventListener(ATHLETE_PLANNING_ACCESS_DENIED_EVENT, handleAthleteAccessDenied);
    return () => {
      window.removeEventListener(ATHLETE_PLANNING_ACCESS_DENIED_EVENT, handleAthleteAccessDenied);
    };
  }, [handleAthleteAccessDenied]);

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
          sx={{ flex: 1, minWidth: 0, px: isSpectatorArea ? 3 : 6, py: 5 }}
        >
          <Outlet />
        </Box>
      </Box>

      <Footer />

      <Snackbar
        open={athleteAccessDenied.open}
        autoHideDuration={8000}
        onClose={closeAthleteAccessDenied}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeAthleteAccessDenied}
          severity="warning"
          variant="filled"
          sx={{ width: "100%", maxWidth: 560 }}
        >
          {athleteAccessDenied.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}