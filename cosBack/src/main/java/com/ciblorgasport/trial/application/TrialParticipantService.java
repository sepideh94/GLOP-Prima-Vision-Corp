package com.ciblorgasport.trial.application;

import java.util.List;

import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.team.dto.TeamResponse;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;

public interface TrialParticipantService {

    List<TrialParticipantResponse> assignAthletes(Long trialId, List<Long> athleteIds);

    List<TrialParticipantResponse> getByTrialId(Long trialId);

    List<TrialParticipantResponse> getByAthleteId(Long athleteId);

    void removeAthlete(Long trialId, Long athleteId);

    void declareForfeit(Long trialParticipantId, Long athleteId);

    List<AthleteResponse> getEligibleAthletes(Long trialId);

    List<TrialParticipantResponse> assignTeams(Long trialId, List<Long> teamIds);

    List<TeamResponse> getEligibleTeams(Long trialId);

    void removeTeam(Long trialId, Long teamId);

    TrialParticipantResponse toResponse(TrialParticipant tp);
}
