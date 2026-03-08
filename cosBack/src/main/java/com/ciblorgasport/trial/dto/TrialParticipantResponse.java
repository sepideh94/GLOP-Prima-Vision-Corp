package com.ciblorgasport.trial.dto;

import java.time.LocalDateTime;

import com.ciblorgasport.trial.domain.TrialParticipant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrialParticipantResponse {

    private Long id;
    private Long trialId;
    private Long athleteId;
    private String athleteFirstName;
    private String athleteLastName;
    private String athleteEmail;
    private LocalDateTime createdAt;

    public static TrialParticipantResponse fromEntity(TrialParticipant tp) {
        return TrialParticipantResponse.builder()
                .id(tp.getId())
                .trialId(tp.getTrial() != null ? tp.getTrial().getId() : null)
                .athleteId(tp.getAthlete() != null ? tp.getAthlete().getId() : null)
                .athleteFirstName(tp.getAthlete() != null ? tp.getAthlete().getFirstName() : null)
                .athleteLastName(tp.getAthlete() != null ? tp.getAthlete().getLastName() : null)
                .athleteEmail(tp.getAthlete() != null ? tp.getAthlete().getEmail() : null)
                .createdAt(tp.getCreatedAt())
                .build();
    }
}
