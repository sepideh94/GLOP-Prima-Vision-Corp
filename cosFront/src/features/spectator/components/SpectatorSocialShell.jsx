import { Box, Paper, Typography, Button, Stack, Badge } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import appTheme from "../../../common/theme/appTheme";

const pageInk = "#0f2744";
const pageMuted = "#475569";
const pageBorder = "rgba(15, 39, 68, 0.1)";

function NavItem({ active, icon, label, onClick, badge }) {
  return (
    <Button
      onClick={onClick}
      startIcon={badge ? badge : icon}
      sx={{
        justifyContent: "flex-start",
        textTransform: "none",
        fontWeight: 800,
        borderRadius: 2,
        px: 1.5,
        py: 1.1,
        color: active ? appTheme.colors.dark : pageInk,
        background: active ? appTheme.gradients.navbar : "transparent",
        border: active ? "1px solid rgba(15,23,42,0.06)" : `1px solid transparent`,
        "&:hover": {
          background: active ? appTheme.gradients.navbar : "rgba(224,242,254,0.6)",
          borderColor: active ? "rgba(15,23,42,0.06)" : "rgba(8,145,178,0.25)",
        },
      }}
      fullWidth
    >
      <Typography sx={{ fontWeight: 800, fontSize: 13, color: "inherit" }}>{label}</Typography>
    </Button>
  );
}

export default function SpectatorSocialShell({
  activeKey = "home",
  onNavigate,
  unreadCount = 0,
  leftTitle = "Spectateur",
  center,
  right,
  hideRight = false,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        fontFamily: appTheme.typography.fontFamily,
      }}
    >
      <Box
        sx={{
          maxWidth: 1320,
          mx: "auto",
          py: { xs: 1, sm: 1.5 },
          px: { xs: 0.5, sm: 0.75, md: 0.75 },
          pb: 5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: hideRight ? "280px 1fr" : "280px 1fr 320px" },
            gap: { xs: 2, md: 2.5 },
            ml: { md: -1.5 },
            alignItems: "start",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              position: { md: "sticky" },
              top: { md: 84 },
              borderRadius: 3,
              border: `1px solid ${pageBorder}`,
              bgcolor: "rgba(255,255,255,0.94)",
              boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: 900, color: pageInk, mb: 1, letterSpacing: "-0.02em" }}>
              {leftTitle}
            </Typography>
            <Typography sx={{ fontWeight: 700, color: pageMuted, fontSize: 13, mb: 1.5, lineHeight: 1.4 }}>
              Menu rapide — style “hub fan”.
            </Typography>

            <Stack spacing={1}>
              <NavItem
                active={activeKey === "home"}
                icon={<HomeOutlinedIcon />}
                label="Accueil"
                onClick={() => onNavigate?.("home")}
              />
              <NavItem
                active={activeKey === "followed"}
                icon={<FavoriteBorderOutlinedIcon />}
                label="Compétitions suivies"
                onClick={() => onNavigate?.("followed")}
              />
              <NavItem
                active={activeKey === "followed_results"}
                icon={<LeaderboardOutlinedIcon />}
                label="Résultats & classements"
                onClick={() => onNavigate?.("followed_results")}
              />
              <NavItem
                active={activeKey === "map"}
                icon={<MapOutlinedIcon />}
                label="Carte & lieux"
                onClick={() => onNavigate?.("map")}
              />
              <NavItem
                active={activeKey === "notifications"}
                icon={<NotificationsNoneOutlinedIcon />}
                label="Notifications"
                badge={
                  <Badge
                    badgeContent={unreadCount > 99 ? "99+" : unreadCount}
                    color="error"
                    invisible={unreadCount === 0}
                    sx={{ "& .MuiBadge-badge": { fontWeight: 900 } }}
                  >
                    <NotificationsNoneOutlinedIcon />
                  </Badge>
                }
                onClick={() => onNavigate?.("notifications")}
              />
              <NavItem
                active={activeKey === "profile"}
                icon={<PersonOutlineOutlinedIcon />}
                label="Profil"
                onClick={() => onNavigate?.("profile")}
              />
              <NavItem
                active={activeKey === "tickets"}
                icon={<ConfirmationNumberOutlinedIcon />}
                label="Billets"
                onClick={() => onNavigate?.("tickets")}
              />
            </Stack>
          </Paper>

          <Box sx={{ minWidth: 0 }}>{center}</Box>

          {!hideRight && (
            <Box sx={{ position: { md: "sticky" }, top: { md: 84 }, alignSelf: "start" }}>{right}</Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

