package com.ciblorgasport.trial.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignAthletesRequest {

    @NotNull(message = "La liste des athlètes est obligatoire.")
    @Size(max = 8, message = "Le nombre maximum d'athlètes par série est de 8.")
    private List<Long> athleteIds;
}
