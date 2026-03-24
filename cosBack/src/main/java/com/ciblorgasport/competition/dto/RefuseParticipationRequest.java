package com.ciblorgasport.competition.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefuseParticipationRequest {

    @NotBlank(message = "Le document refusé doit être spécifié (ex: PASSPORT, MEDICAL_CERTIFICATE, BOTH)")
    private String rejectedDocument;

    @NotBlank(message = "Le motif de refus est obligatoire")
    private String reason;
}
