package com.ciblorgasport.common.api;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private LocalDateTime timestamp;
    private int status;                 // ex: 400, 404, 500
    private String error;               // ex: "Bad Request"
    private String message;             // message global
    private String path;                // ex: /api/events/1

    // pour validation: { "name": "...", "startDate": "..." }
    private Map<String, String> validationErrors;
}
