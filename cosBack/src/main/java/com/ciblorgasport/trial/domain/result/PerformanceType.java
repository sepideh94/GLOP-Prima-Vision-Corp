package com.ciblorgasport.trial.domain.result;

/**
 * Type de performance d'une épreuve, persisté en base de données.
 * Sert de discriminateur pour reconstruire l'objet {@link Performance}
 * via {@link PerformanceFactory}.
 */
public enum PerformanceType {
    TIME,
    POINTS
}
