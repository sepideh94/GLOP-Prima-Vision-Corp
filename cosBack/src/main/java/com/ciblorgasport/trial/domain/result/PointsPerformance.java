package com.ciblorgasport.trial.domain.result;

import java.math.BigDecimal;

import com.ciblorgasport.common.exception.BusinessValidationException;

/**
 * Performance mesurée en points.
 * Sémantique : le plus grand nombre de points est le meilleur (tri décroissant).
 */
public record PointsPerformance(BigDecimal value) implements Performance {

    public PointsPerformance {
        if (value == null)
            throw new BusinessValidationException("Les points ne peuvent pas être nuls.");
    }

    @Override
    public boolean isBetterThan(Performance other) {
        return compareTo(other) < 0;
    }

    @Override
    public int compareTo(Performance other) {
        if (!(other instanceof PointsPerformance o))
            throw new BusinessValidationException("Comparaison impossible entre types de performance différents.");
        return o.value().compareTo(value); // décroissant : plus grand = meilleur = premier
    }

    @Override
    public String formatted() {
        return value.toPlainString() + " pts";
    }
}
