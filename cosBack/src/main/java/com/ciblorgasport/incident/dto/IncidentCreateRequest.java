package com.ciblorgasport.incident.dto;

import java.util.Set;

import com.ciblorgasport.incident.domain.ImpactLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotEmpty
    private Set<ImpactLevel> impactLevels;

    @NotNull
    private Long eventId;

    private Long competitionId;

    private Long siteId;

    private Long trialId;
}