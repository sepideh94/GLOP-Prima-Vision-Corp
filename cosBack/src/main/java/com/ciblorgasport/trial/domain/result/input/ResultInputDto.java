package com.ciblorgasport.trial.domain.result.input;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de saisie manuelle d'un résultat par un commissaire.
 *
 * @param trialParticipantId identifiant du {@link com.ciblorgasport.trial.domain.TrialParticipant}
 * @param performanceValue   valeur brute de la performance (secondes, points...)
 */
public record ResultInputDto(

        @NotNull(message = "L'identifiant du participant est obligatoire.")
        Long trialParticipantId,

        @NotNull(message = "La valeur de performance est obligatoire.")
        @DecimalMin(value = "0.0", message = "La valeur de performance doit être positive.")
        BigDecimal performanceValue
) {}
