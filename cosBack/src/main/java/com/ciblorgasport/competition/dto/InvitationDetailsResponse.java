package com.ciblorgasport.competition.dto;

import com.ciblorgasport.competition.domain.Participation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InvitationDetailsResponse {
    private String competitionName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String athleteFirstName;
    private String athleteLastName;

    public static InvitationDetailsResponse fromEntity(Participation p, String firstName, String lastName) {
        return InvitationDetailsResponse.builder()
                .competitionName(p.getCompetition().getName())
                .startDate(p.getCompetition().getStartDate())
                .endDate(p.getCompetition().getEndDate())
                .athleteFirstName(firstName)
                .athleteLastName(lastName)
                .build();
    }
}