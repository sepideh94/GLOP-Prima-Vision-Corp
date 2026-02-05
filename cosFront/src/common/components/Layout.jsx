import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import appTheme from "../theme/appTheme";

export default function Layout() {
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

        <Sidebar />

        <Box component="main" sx={{ flex: 1, px: 6, py: 5 }}>
          <Outlet />
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}