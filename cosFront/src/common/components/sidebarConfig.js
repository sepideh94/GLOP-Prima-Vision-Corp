import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const sidebarConfig = {
  ADMIN: [
    { label: "Accueil", icon: HomeIcon, path: "/admin" },
    { label: "Gestion des événements", icon: EventIcon, path: "/events" },
    {
      label: "Gestion des compétitions et épreuves",
      icon: EmojiEventsIcon,
      path: "/admin/competitions",
    },
  ],
  GUEST: [],
};

export default sidebarConfig;
