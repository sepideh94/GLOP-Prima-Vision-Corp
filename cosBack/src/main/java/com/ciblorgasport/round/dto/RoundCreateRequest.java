package com.ciblorgasport.round.dto;

import com.ciblorgasport.round.domain.RoundName;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoundCreateRequest {

    @NotNull(message = "Le nom du round est obligatoire.")
    private RoundName name;
}
