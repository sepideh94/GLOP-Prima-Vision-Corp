package com.ciblorgasport.trial.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.ciblorgasport.common.model.Status;
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
    private String siteAddress;
    private Double siteLatitude;
    private Double siteLongitude;
    private Long competitionId;
    private Long roundId;
    private String roundDisplayName;

    private Status status;
    private String statusLabel;

    private boolean cancelled;
    private LocalDateTime cancelledAt;

    private boolean hasStarted;
    private boolean hasEnded;

    /*
     * Méthode de conversion statique depuis l'entité Trial.
     */
    public static TrialResponse fromEntity(Trial trial) {
        Status status = trial.getStatus();

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
                .siteAddress(trial.getSite() != null ? trial.getSite().getAdress() : null)
                .siteLatitude(trial.getSite() != null ? trial.getSite().getLatitude() : null)
                .siteLongitude(trial.getSite() != null ? trial.getSite().getLongitude() : null)
                .competitionId(trial.getCompetition() != null ? trial.getCompetition().getId() : null)
                .roundId(trial.getRound() != null ? trial.getRound().getId() : null)
                .roundDisplayName(trial.getRound() != null ? trial.getRound().getDisplayName() : null)
                .status(status)
                .statusLabel(status.getLabel())
                .cancelled(trial.isCancelled())
                .cancelledAt(trial.getCancelledAt())
                .hasStarted(trial.hasStarted())
                .hasEnded(trial.hasEnded())
                .build();
    }
}
