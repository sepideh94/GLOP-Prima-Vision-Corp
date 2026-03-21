package com.ciblorgasport.trial.dto;

import java.util.List;

import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.input.ResultInputDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RecordResultsRequest(

        @NotNull(message = "Le type de performance est obligatoire.")
        PerformanceType performanceType,

        @NotEmpty(message = "La liste des résultats ne peut pas être vide.")
        @Valid
        List<ResultInputDto> results
) {}
