package com.ciblorgasport.competition.dto;

import java.time.LocalDateTime;

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
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long parentEventId;
    
    private String statusLabel;

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
                .endDate(competition.getEndDate())
                .parentEventId(parentEvent.getId())
                .statusLabel(determineStatusLabel(competition))
                .build();
    }
    
    
    private static String determineStatusLabel(Competition competition) {
        if (competition.hasEnded()) {
            return "Terminée";
        }
        if (competition.hasStarted()) {
            return "En cours";
        }
        
        return "À venir";
    }
}