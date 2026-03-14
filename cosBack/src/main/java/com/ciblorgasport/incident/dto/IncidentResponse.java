package com.ciblorgasport.incident.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.IncidentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IncidentResponse {

    private Long id;
    private String title;
    private String description;

    private Set<ImpactLevel> impactLevels;
    private IncidentStatus status;

    private Long eventId;
    private Long competitionId;
    private Long siteId;
    private Long trialId;

    private Long createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}