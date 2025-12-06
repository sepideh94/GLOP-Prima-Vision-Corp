package com.ciblorgasport.competition.dto;

import java.time.LocalDate;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.event.domain.Event;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompetitionResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private Long parentEventId;
    

    /**
     * Méthode de conversion statique depuis l'entité Competition.
     */
    public static CompetitionResponse fromEntity(Competition competition) {
        
        Event parentEvent = competition.getParentEvent();
        
        return CompetitionResponse.builder()
                .id(competition.getId())
                .name(competition.getName())
                .description(competition.getDescription())
                .startDate(competition.getStartDate())
                .parentEventId(parentEvent.getId())
                .build();
    }
}