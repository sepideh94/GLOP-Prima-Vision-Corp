package com.ciblorgasport.trial.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.TrialParticipantStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrialParticipantResponse {

    private Long id;
    private Long trialId;
    private String trialName;
    private LocalDate startDate;
    private LocalTime startHour;
    private LocalDate endDate;
    private LocalTime endHour;
    private Long athleteId;
    private String athleteFirstName;
    private String athleteLastName;
    private String athleteEmail;
    private TrialParticipantStatus status;
    private LocalDateTime createdAt;

    public static TrialParticipantResponse fromEntity(TrialParticipant tp) {
        return TrialParticipantResponse.builder()
                .id(tp.getId())
                .trialId(tp.getTrial() != null ? tp.getTrial().getId() : null)
                .trialName(tp.getTrial() != null && tp.getTrial().getTrialName() != null
                        ? tp.getTrial().getTrialName().name()
                        : null)
                .startDate(tp.getTrial() != null ? tp.getTrial().getStartDate() : null)
                .startHour(tp.getTrial() != null ? tp.getTrial().getStartHour() : null)
                .endDate(tp.getTrial() != null ? tp.getTrial().getEndDate() : null)
                .endHour(tp.getTrial() != null ? tp.getTrial().getEndHour() : null)
                .athleteId(tp.getAthlete() != null ? tp.getAthlete().getId() : null)
                .athleteFirstName(tp.getAthlete() != null ? tp.getAthlete().getFirstName() : null)
                .athleteLastName(tp.getAthlete() != null ? tp.getAthlete().getLastName() : null)
                .athleteEmail(tp.getAthlete() != null ? tp.getAthlete().getEmail() : null)
                .status(tp.getStatus())
                .createdAt(tp.getCreatedAt())
                .build();
    }
}