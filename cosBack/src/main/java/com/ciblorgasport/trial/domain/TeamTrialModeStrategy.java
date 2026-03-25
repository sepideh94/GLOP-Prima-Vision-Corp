package com.ciblorgasport.trial.domain;

import org.springframework.stereotype.Component;

import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.competition.domain.CompetitorType;

/**
 * Stratégie pour les épreuves en mode équipe (TEAM).
 * <p>
 * Seules les équipes ({@link CompetitorType#TEAM}) peuvent s'inscrire.
 * Le nombre maximum par série est fixé à {@value #MAX_PER_HEAT}.
 * <p>
 * Cette stratégie sera pleinement opérationnelle lors de l'introduction
 * de l'entité {@code Team} dans le domaine.
 */
@Component
public class TeamTrialModeStrategy implements TrialModeStrategy {

    private static final int MAX_PER_HEAT = 8;

    @Override
    public CompetitorType getExpectedCompetitorType() {
        return CompetitorType.TEAM;
    }

    @Override
    public int getMaxParticipantsPerHeat() {
        return MAX_PER_HEAT;
    }

    @Override
    public void validateParticipant(Participant participant) {
        if (participant.getCompetitorType() != CompetitorType.TEAM) {
            throw new BusinessValidationException(
                "En mode équipe, seules les équipes peuvent participer. "
                + "Type reçu : " + participant.getCompetitorType()
                + " (participant : \"" + participant.getDisplayName() + "\").");
        }
    }

    @Override
    public String getParticipantTypeLabel() {
        return "équipe";
    }
}
