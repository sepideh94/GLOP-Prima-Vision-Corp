package com.ciblorgasport.trial.domain;

import com.ciblorgasport.competition.domain.CompetitorType;

/**
 * Stratégie pour les épreuves en mode individuel (INDIVIDUAL).
 * <p>
 * Seuls les athlètes ({@link CompetitorType#ATHLETE}) peuvent s'inscrire.
 * Le nombre maximum par série est fixé à {@value #MAX_PER_HEAT}.
 */
public class IndividualTrialModeStrategy implements TrialModeStrategy {

    private static final int MAX_PER_HEAT = 8;

    @Override
    public CompetitorType getExpectedCompetitorType() {
        return CompetitorType.ATHLETE;
    }

    @Override
    public int getMaxParticipantsPerHeat() {
        return MAX_PER_HEAT;
    }

    @Override
    public void validateParticipant(Participant participant) {
        if (participant.getCompetitorType() != CompetitorType.ATHLETE) {
            throw new IllegalArgumentException(
                "En mode individuel, seuls les athlètes peuvent participer. "
                + "Type reçu : " + participant.getCompetitorType()
                + " (participant : \"" + participant.getDisplayName() + "\").");
        }
    }

    @Override
    public String getParticipantTypeLabel() {
        return "athlète";
    }
}
