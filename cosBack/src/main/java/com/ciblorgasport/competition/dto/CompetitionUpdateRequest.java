package com.ciblorgasport.competition.dto;

import lombok.Data;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;

@Data
public class CompetitionUpdateRequest {
 
    @NotBlank(message = "Le nom de la compétition est obligatoire.")
    private String name;

    private String description;

    @NotNull(message = "La date de début est obligatoire.")
    @FutureOrPresent(message = "La date de début doit être dans le présent ou le futur.")
    private LocalDate startDate;
}