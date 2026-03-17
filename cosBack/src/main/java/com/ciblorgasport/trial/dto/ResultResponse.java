package com.ciblorgasport.trial.dto;

import com.ciblorgasport.trial.domain.result.Result;

import lombok.Builder;
import lombok.Data;

/**
 * DTO représentant le résultat classé d'un participant à une épreuve.
 * Compatible athlètes individuels et équipes : les infos du compétiteur
 * sont portées par {@link TrialParticipantResponse} (displayName + members).
 */
@Data
@Builder
public class ResultResponse {

    private Long id;
    private Long trialId;
    private int rank;
    private boolean tie;
    private String performanceType;
    private String performance;

    /** Informations du participant (athlète ou équipe avec ses membres). */
    private TrialParticipantResponse participant;

    public static ResultResponse from(Result result, TrialParticipantResponse participantResponse) {
        return ResultResponse.builder()
                .id(result.getId())
                .trialId(result.getTrial() != null ? result.getTrial().getId() : null)
                .rank(result.getRank())
                .tie(result.isTie())
                .performanceType(result.getPerformanceType().name())
                .performance(result.getPerformance().formatted())
                .participant(participantResponse)
                .build();
    }
}
