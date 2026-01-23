import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";

const sidebarConfig = {
  ADMIN: [
    { label: "Accueil", icon: HomeIcon, path: "/admin" },
    { label: "Gestion des événements", icon: EventIcon, path: "/events" },
    {
      label: "Gestion des compétitions et épreuves",
      icon: EmojiEventsIcon,
      path: "/admin/competitions",
    },
    {
      label: "Gestion des utilisateurs",
      icon: PeopleIcon,
      path: "/admin/users",
    },
  ],

  COMMISSIONNER: [
    { label: "Accueil", icon: HomeIcon, path: "/commissioner" },
    {
      label: "Gestion des compétitions et épreuves",
      icon: EmojiEventsIcon,
      path: "/commissioner/competitions",
    },
    {
      label: "Gestion des athlètes",
      icon: PeopleIcon,
      path: "/commissioner/participants",
    },
  ],

  GUEST: [],
};

export default sidebarConfig;
