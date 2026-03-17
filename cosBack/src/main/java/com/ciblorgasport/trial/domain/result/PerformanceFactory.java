package com.ciblorgasport.trial.domain.result;

import java.math.BigDecimal;

/**
 * Recrée un objet {@link Performance} à partir des données stockées en base.
 * Pour ajouter un nouveau type de performance :
 * <ol>
 *   <li>Créer le record implémentant {@link Performance}</li>
 *   <li>Ajouter la valeur dans {@link PerformanceType}</li>
 *   <li>Ajouter le cas dans le switch ci-dessous</li>
 * </ol>
 * Aucun autre code n'a besoin d'être modifié.
 */
public final class PerformanceFactory {

    private PerformanceFactory() {}

    public static Performance create(PerformanceType type, BigDecimal value) {
        return switch (type) {
            case TIME   -> new TimePerformance(value);
            case POINTS -> new PointsPerformance(value);
        };
    }
}
