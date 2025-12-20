package com.ciblorgasport.core;

/**
 * Represents the status of a competition or trial.
 * Status is calculated dynamically based on dates, times, and cancellation state.
 */
public enum Status {
    /**
     * Event has not started yet (start date/time is in the future)
     */
    UPCOMING,

    /**
     * Event is currently ongoing (current date/time is between start and end)
     */
    IN_PROGRESS,

    /**
     * Event has finished (end date/time has passed, or all trials completed for competitions)
     */
    COMPLETED,

    /**
     * Event has been cancelled by an admin or commissioner (permanent)
     */
    CANCELED;

    /**
     * Returns a human-readable French label for the status
     */
    public String getLabel() {
        return switch (this) {
            case UPCOMING -> "À venir";
            case IN_PROGRESS -> "En cours";
            case COMPLETED -> "Terminée";
            case CANCELED -> "Annulée";
        };
    }
}
