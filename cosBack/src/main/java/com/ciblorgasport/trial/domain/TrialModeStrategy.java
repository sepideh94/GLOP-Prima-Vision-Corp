package com.ciblorgasport.trial.domain;

import com.ciblorgasport.competition.domain.CompetitorType;

/**
 * Strategy Pattern — encapsule la logique métier spécifique au mode d'une épreuve.
 * <p>
 * Chaque implémentation représente un mode de compétition (INDIVIDUAL, TEAM...).
 * Les services métier obtiennent la bonne stratégie via {@link TrialModeStrategyFactory}
 * à partir de l'enum {@link TrialMode} persisté en base.
 * <p>
 * Pour ajouter un nouveau mode : implémenter cette interface, créer une entrée
 * dans {@link TrialMode} et enregistrer la stratégie dans la factory — sans
 * modifier aucun service existant.
 */
public interface TrialModeStrategy {

    /**
     * Type de compétiteur attendu pour ce mode (ATHLETE, TEAM...).
     */
    CompetitorType getExpectedCompetitorType();

    /**
     * Nombre maximum de participants autorisés par série/heat.
     */
    int getMaxParticipantsPerHeat();

    /**
     * Valide qu'un participant est éligible pour ce mode d'épreuve.
     *
     * @param participant le compétiteur à valider
     * @throws IllegalArgumentException si le type de participant ne correspond pas au mode
     */
    void validateParticipant(Participant participant);

    /**
     * Libellé du type de participant attendu, utilisé dans les messages d'erreur.
     * Exemple : "athlète", "équipe"
     */
    String getParticipantTypeLabel();
}
