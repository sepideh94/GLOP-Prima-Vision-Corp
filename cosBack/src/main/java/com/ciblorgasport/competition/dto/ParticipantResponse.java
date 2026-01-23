package com.ciblorgasport.competition.dto;

import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.ParticipationStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ParticipantResponse {
    private Long participationId;
    private Long competitorId;
    private CompetitorType competitorType;
    private String firstName;
    private String lastName;
    private String email;
    private ParticipationStatus status;
    private Long competitionId;
    private String competitionName;
}
