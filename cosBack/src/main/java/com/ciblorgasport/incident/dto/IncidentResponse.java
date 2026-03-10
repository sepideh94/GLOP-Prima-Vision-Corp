package com.ciblorgasport.incident.dto;

import java.time.LocalDateTime;

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

    private ImpactLevel impactLevel;
    private IncidentStatus status;

    private Long competitionId;
    private Long siteId;

    private Long createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}