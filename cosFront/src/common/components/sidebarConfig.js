import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import StadiumIcon from "@mui/icons-material/Stadium";
import MapIcon from "@mui/icons-material/Map";

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
      label: "Gestion des volontaires",
      icon: VolunteerActivismIcon,
      path: "/admin/volunteers"
    },
    {
      label: "Gestion des incidents",
      icon: ReportProblemIcon,
      path: "/admin/incidents",
    },
    {
      label: "Gestion des utilisateurs",
      icon: PeopleIcon,
      path: "/admin/users",
    },
    {
      label: "Planning",
      icon: ScheduleIcon,
      path: "/admin/schedules/create",
    },
    {
      label: "Fan Zones",
      icon: StadiumIcon,
      path: "/admin/fan-zones",
    },
    {
      label: "Carte opérations",
      icon: MapIcon,
      path: "/admin/map",
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

  ATHLETE: [
    { label: "Tableau de bord", icon: HomeIcon, path: "/athlete" },
    {
      label: "Compétitions",
      icon: EmojiEventsIcon,
      path: "/athlete/competitions",
    },
  ],

  SPECTATOR: [
    { label: "Accueil", icon: HomeIcon, path: "/spectator" },
    {
      label: "Mon profil",
      icon: PeopleIcon,
      path: "/spectator/profile",
    },
  ],

  GUEST: [],
};

export default sidebarConfig;