package com.ciblorgasport.competition.domain;

/**
 * Statut de participation d'un compétiteur à une compétition.
 */
public enum ParticipationStatus {
    PENDING,
    PENDING_VALIDATION,
    INVITED,
    CONFIRMED,
    CANCELLED
}
