package com.ciblorgasport.trial.dto;

import java.time.LocalDateTime;

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

    /** Nom du commissaire ayant modifié le résultat (null si jamais modifié). */
    private String updatedBy;

    /** Horodatage de la dernière modification (null si jamais modifié). */
    private LocalDateTime updatedAt;

    public static ResultResponse from(Result result, TrialParticipantResponse participantResponse) {
        String updatedByName = result.getUpdatedBy() != null
                ? result.getUpdatedBy().getFirstName() + " " + result.getUpdatedBy().getLastName()
                : null;

        return ResultResponse.builder()
                .id(result.getId())
                .trialId(result.getTrial() != null ? result.getTrial().getId() : null)
                .rank(result.getRank())
                .tie(result.isTie())
                .performanceType(result.getPerformanceType().name())
                .performance(result.getPerformance().formatted())
                .participant(participantResponse)
                .updatedBy(updatedByName)
                .updatedAt(result.getUpdatedAt())
                .build();
    }
}
