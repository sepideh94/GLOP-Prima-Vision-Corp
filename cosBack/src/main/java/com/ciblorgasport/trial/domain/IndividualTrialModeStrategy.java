package com.ciblorgasport.trial.domain;

import org.springframework.stereotype.Component;

import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.competition.domain.CompetitorType;

/**
 * Stratégie pour les épreuves en mode individuel (INDIVIDUAL).
 * <p>
 * Seuls les athlètes ({@link CompetitorType#ATHLETE}) peuvent s'inscrire.
 * Le nombre maximum par série est fixé à {@value #MAX_PER_HEAT}.
 */
@Component
public class IndividualTrialModeStrategy implements TrialModeStrategy {

    private static final int MAX_PER_HEAT = 8;

    @Override
    public TrialMode getMode() {
        return TrialMode.INDIVIDUAL;
    }

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
            throw new BusinessValidationException(
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
