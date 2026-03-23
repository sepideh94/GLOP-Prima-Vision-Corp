/** Verre bleu-cyan et textes lisibles — pages espace spectateur (accueil, notifications, …) */

export const spectatorGlassTint =
  "linear-gradient(165deg, rgba(207, 250, 254, 0.6) 0%, rgba(165, 243, 252, 0.4) 45%, rgba(125, 211, 252, 0.5) 100%)";

/** Texte directement sur le verre / la photo (halo renforcé) */
export const textLegibleDark = {
  color: "#020617",
  fontWeight: 800,
  textShadow:
    "0 1px 0 rgba(255,255,255,1), 0 0 2px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.95), 0 2px 10px rgba(255,255,255,0.7)",
};

export const textLegibleMuted = {
  color: "#0f172a",
  fontWeight: 700,
  textShadow:
    "0 1px 0 rgba(255,255,255,0.98), 0 0 14px rgba(255,255,255,0.9), 0 1px 6px rgba(255,255,255,0.65)",
};

/** Texte dans un encadré blanc (pas d’ombre, contraste net) */
export const textOnPanel = {
  color: "#0f172a",
  fontWeight: 700,
};

export const textOnPanelSecondary = {
  color: "#1e293b",
  fontWeight: 600,
};

/** Barre sombre type « Toutes les compétitions » / menu carrousel événements */
export const spectatorDarkMenuShell = {
  background: "rgba(30, 41, 59, 0.88)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(15, 23, 42, 0.85)",
  borderRadius: "8px",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.22)",
};
