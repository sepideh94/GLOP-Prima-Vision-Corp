import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import appTheme from "../theme/appTheme";
import { SPECTATOR_PAGE_BACKGROUND } from "../../features/spectator/swimmingVisuals";

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
        position: "relative",
        ...(isSpectatorArea
          ? { background: "transparent" }
          : { background: appTheme.gradients.page }),
      }}
    >
      {isSpectatorArea && (
        <Box
          aria-hidden
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            backgroundColor: "#0e7490",
            backgroundImage: [
              "linear-gradient(180deg, rgba(15,23,42,0.28) 0%, rgba(15,23,42,0.12) 40%, rgba(15,23,42,0.38) 100%)",
              `url(${SPECTATOR_PAGE_BACKGROUND})`,
            ].join(", "),
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh",
        }}
      >
        <Navbar />

        <Box sx={{ display: "flex", flex: 1, minHeight: 0, mt: "64px" }}>
          {!isSpectatorArea && <Sidebar />}

          <Box
            component="main"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              minHeight: 0,
              px: isSpectatorArea ? 0 : 6,
              py: isSpectatorArea ? 0 : 5,
              ...(isSpectatorArea && { background: "transparent" }),
            }}
          >
            <Outlet />
          </Box>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
