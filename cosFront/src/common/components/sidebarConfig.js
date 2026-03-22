import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import NotificationsIcon from "@mui/icons-material/Notifications";

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
      label: "Notifications",
      icon: NotificationsIcon,
      path: "/notifications",
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
    {
      label: "Notifications",
      icon: NotificationsIcon,
      path: "/notifications",
    },
  ],

  ATHLETE: [
    { label: "Tableau de bord", icon: HomeIcon, path: "/athlete" },
    {
      label: "Mes compétitions",
      icon: EmojiEventsIcon,
      path: "/athlete/competitions",
    },
    {
      label: "Mes notifications",
      icon: NotificationsIcon,
      path: "/notifications",
    },
    { label: "Mon profil", icon: PersonIcon, path: "/athlete/profile" },
  ],

  VOLONTEER: [
    { label: "Accueil", icon: HomeIcon, path: "/volunteer" },
    {
      label: "Notifications",
      icon: NotificationsIcon,
      path: "/notifications",
    },
  ],

  SPECTATOR: [
    { label: "Accueil", icon: HomeIcon, path: "/spectator" },
    {
      label: "Mon profil",
      icon: PeopleIcon,
      path: "/spectator/profile",
    },
    {
      label: "Notifications",
      icon: NotificationsIcon,
      path: "/spectator/notifications",
    },
  ],

  GUEST: [],
};

export default sidebarConfig;