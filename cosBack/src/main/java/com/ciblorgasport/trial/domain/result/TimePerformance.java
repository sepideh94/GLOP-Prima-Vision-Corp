package com.ciblorgasport.trial.domain.result;

import java.math.BigDecimal;

/**
 * Performance mesurée en secondes.
 * Sémantique : le temps le plus court est le meilleur (tri croissant).
 */
public record TimePerformance(BigDecimal value) implements Performance {

    public TimePerformance {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("Le temps doit être un nombre positif.");
    }

    @Override
    public boolean isBetterThan(Performance other) {
        return compareTo(other) < 0;
    }

    @Override
    public int compareTo(Performance other) {
        if (!(other instanceof TimePerformance o))
            throw new IllegalArgumentException("Comparaison impossible entre types de performance différents.");
        return value.compareTo(o.value()); // croissant : plus petit = meilleur = premier
    }

    @Override
    public String formatted() {
        return value.toPlainString() + "s";
    }
}
