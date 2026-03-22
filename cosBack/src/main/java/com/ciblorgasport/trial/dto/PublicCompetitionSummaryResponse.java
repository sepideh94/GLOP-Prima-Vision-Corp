package com.ciblorgasport.trial.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicCompetitionSummaryResponse {
    private Long competitionId;
    private String competitionName;
    private LocalDateTime lastUpdatedAt;
    private List<CompetitionResultsResponse> trialGroups;
}
