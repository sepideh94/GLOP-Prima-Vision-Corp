import appTheme from "../../../common/theme/appTheme";

export const STATUS_LABELS = {
  INVITED: "Invité",
  CONFIRMED: "Confirmé",
  CANCELED: "Annulé",
};

export const getStatusStyle = (status) => ({
  padding: "6px 14px",
  borderRadius: appTheme.radius.pill,
  fontSize: 13,
  fontWeight: 700,
  display: "inline-block",
  minWidth: 110,
  textAlign: "center",
  background:
    status === "CONFIRMED"
      ? "rgba(34,197,94,0.25)"
      : status === "INVITED"
      ? "rgba(250,204,21,0.25)"
      : "rgba(239,68,68,0.25)",
  color: appTheme.colors.dark,
});