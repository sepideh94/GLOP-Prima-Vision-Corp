import appTheme from "../../../common/theme/appTheme";

/**
 * Libellés FR pour les statuts API (IN_PROGRESS, enums, chaînes brutes).
 */
export function competitionStatusLabel(status, backendLabel) {
  const bl = String(backendLabel ?? "").trim();
  if (bl && !/^(UPCOMING|IN_PROGRESS|ONGOING|COMPLETED|CANCELED|CANCELLED)$/i.test(bl)) {
    return bl;
  }

  const raw = String(status ?? "").trim();
  const s = raw.toUpperCase().replace(/[\s-]+/g, "_");

  const map = {
    UPCOMING: "À venir",
    IN_PROGRESS: "En cours",
    ONGOING: "En cours",
    COMPLETED: "Terminé",
    COMPLETE: "Terminé",
    CANCELED: "Annulée",
    CANCELLED: "Annulée",
    FINISHED: "Terminé",
    SCHEDULED: "À venir",
    LIVE: "En cours",
  };

  return map[s] || raw || "Non défini";
}

export function competitionStatusColor(status) {
  const s = String(status ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  switch (s) {
    case "UPCOMING":
    case "SCHEDULED":
      return appTheme.colors.cyan;
    case "IN_PROGRESS":
    case "ONGOING":
    case "LIVE":
      return appTheme.colors.green;
    case "COMPLETED":
    case "COMPLETE":
    case "FINISHED":
      return appTheme.colors.violet;
    case "CANCELED":
    case "CANCELLED":
      return appTheme.colors.yellow;
    default:
      return appTheme.colors.textMuted;
  }
}

/**
 * Les événements n’ont souvent pas de `status` en API : on déduit un libellé des dates.
 * Si `event.status` est renseigné, on utilise la même logique que les compétitions.
 */
export function eventStatusChipProps(event) {
  if (!event) {
    return { label: "—", color: appTheme.colors.textMuted };
  }

  const hasApiStatus =
    event.status != null && String(event.status).trim() !== "";

  if (hasApiStatus) {
    return {
      label: competitionStatusLabel(event.status, event.statusLabel),
      color: competitionStatusColor(event.status),
    };
  }

  const now = new Date();
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;

  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return { label: "À venir", color: competitionStatusColor("UPCOMING") };
  }
  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return { label: "Terminé", color: competitionStatusColor("COMPLETED") };
  }
  if (start || end) {
    return { label: "En cours", color: competitionStatusColor("IN_PROGRESS") };
  }

  return { label: "Programmé", color: appTheme.colors.cyan };
}
