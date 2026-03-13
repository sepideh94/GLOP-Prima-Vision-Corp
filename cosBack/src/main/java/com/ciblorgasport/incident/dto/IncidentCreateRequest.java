package com.ciblorgasport.incident.dto;

import com.ciblorgasport.incident.domain.ImpactLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private ImpactLevel impactLevel;

    @NotNull
    private Long eventId;

    private Long competitionId;

    private Long siteId;

    private Long trialId;
}