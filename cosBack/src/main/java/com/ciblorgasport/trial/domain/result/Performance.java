package com.ciblorgasport.trial.domain.result;

import java.math.BigDecimal;

/**
 * Value Object représentant la performance d'un participant lors d'une épreuve.
 * Chaque implémentation définit sa propre sémantique de comparaison :
 * un temps se classe en ordre croissant, des points en ordre décroissant.
 * <p>
 * Pour ajouter un nouveau type : créer un record implémentant cette interface
 * et ajouter un cas dans {@link PerformanceType} et {@link PerformanceFactory}.
 */
public interface Performance {

    /** Valeur brute de la performance, stockable en base de données. */
    BigDecimal value();

    /**
     * Indique si cette performance est meilleure que {@code other}.
     *
     * @throws IllegalArgumentException si {@code other} est d'un type incompatible
     */
    boolean isBetterThan(Performance other);

    /**
     * Compare cette performance à {@code other} pour le tri.
     * Retourne un entier négatif si cette performance doit apparaître avant,
     * zéro si égale, positif sinon.
     *
     * @throws IllegalArgumentException si {@code other} est d'un type incompatible
     */
    int compareTo(Performance other);

    /** Représentation lisible (ex : "10.05s", "9.75 pts"). */
    String formatted();
}
