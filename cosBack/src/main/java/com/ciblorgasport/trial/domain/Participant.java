package com.ciblorgasport.trial.domain;

import com.ciblorgasport.competition.domain.CompetitorType;

/**
 * Abstraction représentant un compétiteur pouvant être inscrit à une épreuve.
 * <p>
 * Permet aux stratégies de mode ({@link TrialModeStrategy}) de valider les
 * inscriptions sans dépendre des entités concrètes (Athlete, Team...).
 * L'adaptateur est construit à la couche applicative (service).
 */
public interface Participant {

    /** Identifiant unique du compétiteur. */
    Long getId();

    /** Nom affiché (utilisé dans les messages d'erreur). */
    String getDisplayName();

    /** Type de compétiteur (ATHLETE, TEAM...). */
    CompetitorType getCompetitorType();
}
