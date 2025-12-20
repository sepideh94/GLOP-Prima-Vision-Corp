package com.ciblorgasport.core;

/**
 * Représente le statut d'une compétition ou d'une épreuve.
 * Le statut est calculé dynamiquement en fonction des dates, des heures et du statut d'annulation..
 */
public enum Status {
    UPCOMING,

    IN_PROGRESS,

    COMPLETED,

    CANCELED;
    public String getLabel() {
        return switch (this) {
            case UPCOMING -> "À venir";
            case IN_PROGRESS -> "En cours";
            case COMPLETED -> "Terminée";
            case CANCELED -> "Annulée";
        };
    }
}
