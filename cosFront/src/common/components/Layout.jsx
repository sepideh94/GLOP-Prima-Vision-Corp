import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: `
          radial-gradient(circle at 20% 30%, rgba(163,230,53,0.18), transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(34,211,238,0.15), transparent 55%),
          linear-gradient(135deg, #F1F5F9, #CBD5E1)
        `,
      }}
    >
      <Navbar />

      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <Box component="main" sx={{ flex: 1, px: 6, py: 5 }}>
          <Outlet />
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
