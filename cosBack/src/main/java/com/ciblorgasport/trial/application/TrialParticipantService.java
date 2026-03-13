package com.ciblorgasport.trial.application;

import java.util.List;

import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;

public interface TrialParticipantService {

    /**
     * Assigne des athlètes à un trial (séries de qualification uniquement).
     * Accepte de 0 à 8 IDs d'athlètes.
     */
    List<TrialParticipantResponse> assignAthletes(Long trialId, List<Long> athleteIds);

    /**
     * Récupère tous les participants d'un trial.
     */
    List<TrialParticipantResponse> getByTrialId(Long trialId);

    /**
     * Retire un athlète d'un trial.
     */
    void removeAthlete(Long trialId, Long athleteId);

    /**
     * Retourne les athlètes éligibles pour un trial selon sa phase :
     * - QUALIFICATION_HEAT : tous les athlètes CONFIRMED de la compétition
     * - DEMI_FINALE : athlètes ayant participé à une qualification du même type
     * - FINALE : athlètes ayant participé à une demi-finale du même type
     */
    List<AthleteResponse> getEligibleAthletes(Long trialId);

    public List<TrialParticipantResponse> assignTeams(Long trialId, List<Long> teamIds) ;
}
