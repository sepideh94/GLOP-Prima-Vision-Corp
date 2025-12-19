package com.ciblorgasport.trial.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialMode;
import com.ciblorgasport.trial.domain.TrialName;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrialResponse {
    private Long id;
    private String name;
    private TrialName trialName;
    private Integer roundNumber;
    private String description;
    private String rules;
    private LocalDate startDate;
    private LocalTime startHour;
    private LocalDate endDate;
    private LocalTime endHour;
    private TrialMode mode;
    private CategoryGender categoryGender;
    private Long siteId;
    private Long competitionId;
    private Long roundId;
    private boolean hasStarted;
    private boolean hasEnded;

    /*
     * Méthode de conversion statique depuis l'entité Trial.
     */
    public static TrialResponse fromEntity(Trial trial) {
        return TrialResponse.builder()
                .id(trial.getId())
                .name(trial.getName())
                .trialName(trial.getTrialName())
                .roundNumber(trial.getRoundNumber())
                .description(trial.getDescription())
                .rules(trial.getRules())
                .startDate(trial.getStartDate())
                .startHour(trial.getStartHour())
                .endDate(trial.getEndDate())
                .endHour(trial.getEndHour())
                .mode(trial.getMode())
                .categoryGender(trial.getCategoryGender())
                .siteId(trial.getSite() != null ? trial.getSite().getId() : null)
                .competitionId(trial.getCompetition() != null ? trial.getCompetition().getId() : null)
                .roundId(trial.getRound() != null ? trial.getRound().getId() : null)
                .hasStarted(trial.hasStarted())
                .hasEnded(trial.hasEnded())
                .build();
    }
}
