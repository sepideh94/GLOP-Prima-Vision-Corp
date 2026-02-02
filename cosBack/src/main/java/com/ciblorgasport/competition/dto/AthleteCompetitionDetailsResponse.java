package com.ciblorgasport.competition.dto;

import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AthleteCompetitionDetailsResponse {
	private Long participationId;
    private String competitionName;
    private String eventName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ParticipationStatus status; 
    private String location;

    public static AthleteCompetitionDetailsResponse fromEntity(Participation p) {
        return AthleteCompetitionDetailsResponse.builder()
                .participationId(p.getId())
                .competitionName(p.getCompetition().getName())
                .eventName(p.getCompetition().getParentEvent() != null ? p.getCompetition().getParentEvent().getName() : "")
                .startDate(p.getCompetition().getStartDate())
                .endDate(p.getCompetition().getEndDate())
                .status(p.getStatus()) 
                .build();
    }
}
