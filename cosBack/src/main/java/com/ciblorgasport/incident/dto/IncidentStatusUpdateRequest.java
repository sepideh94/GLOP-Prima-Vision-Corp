package com.ciblorgasport.incident.dto;

import com.ciblorgasport.incident.domain.IncidentStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentStatusUpdateRequest {
    @NotNull
    private IncidentStatus status;
}