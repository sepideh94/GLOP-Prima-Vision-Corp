package com.ciblorgasport.trial.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.TrialParticipantStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrialParticipantResponse {

    private Long id;
    private Long trialId;
    private Long competitorId;
    private CompetitorType competitorType;
    private String displayName;
    private TrialParticipantStatus status;
    private LocalDateTime createdAt;
    private List<AthleteSummary> members;

    public static TrialParticipantResponse fromEntity(TrialParticipant tp) {
        return TrialParticipantResponse.builder()
                .id(tp.getId())
                .trialId(tp.getTrial() != null ? tp.getTrial().getId() : null)
                .competitorId(tp.getCompetitorId())
                .competitorType(tp.getCompetitorType())
                .status(tp.getStatus())
                .createdAt(tp.getCreatedAt())
                .build();
    }

    public static TrialParticipantResponse fromEntity(TrialParticipant tp, String displayName, List<AthleteSummary> members) {
        return TrialParticipantResponse.builder()
                .id(tp.getId())
                .trialId(tp.getTrial() != null ? tp.getTrial().getId() : null)
                .competitorId(tp.getCompetitorId())
                .competitorType(tp.getCompetitorType())
                .displayName(displayName)
                .status(tp.getStatus())
                .createdAt(tp.getCreatedAt())
                .members(members)
                .build();
    }

    public static TrialParticipantResponse fromEntity(TrialParticipant tp, String displayName) {
        return fromEntity(tp, displayName, null);
    }
}