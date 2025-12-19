package com.ciblorgasport.event.api.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventUpdateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private LocalDateTime startDate;

    private LocalDateTime endDate; 
}
