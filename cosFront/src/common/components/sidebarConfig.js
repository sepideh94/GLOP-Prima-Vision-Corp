import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const sidebarConfig = {
  ADMIN: [
    {
      label: "Menu",
      icon: HomeIcon,
      path: "/admin",
    },
    {
      label: "Gestion des événements",
      icon: EventIcon,
      path: "/events",
    },
    {
      label: "Gestion des compétitions",
      icon: EmojiEventsIcon,
      path: "/admin/competitions",
    }
  ],

  COMMISSIONER: [
    { label: "Menu", icon: HomeIcon, path: "/commissioner" }
  ],

  ATHLETE: [
    { label: "Menu", icon: HomeIcon, path: "/athlete" }
  ],

  VOLUNTEER: [
    { label: "Menu", icon: HomeIcon, path: "/volunteer" }
  ],

  SPECTATOR: [
    { label: "Menu", icon: HomeIcon, path: "/spectator" }
  ],

  GUEST: [],
};

export default sidebarConfig;
