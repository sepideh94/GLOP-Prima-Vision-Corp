package com.ciblorgasport.trial.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.TrialMode;
import com.ciblorgasport.trial.domain.TrialName;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrialUpdateRequest {

    @NotNull(message = "Le nom de l'épreuve est obligatoire.")
    private TrialName trialName;

    /**
     * Optional round number (e.g., 1, 2, 3 for Heat 1, Heat 2, Heat 3)
     */
    private Integer roundNumber;

    private String description;

    private String rules;

    @NotNull(message = "La date de début est obligatoire.")
    private LocalDate startDate;

    @NotNull(message = "L'heure de début est obligatoire.")
    private LocalTime startHour;

    @NotNull(message = "La date de fin est obligatoire.")
    private LocalDate endDate;

    @NotNull(message = "L'heure de fin est obligatoire.")
    private LocalTime endHour;

    @NotNull(message = "Le mode de l'épreuve est obligatoire.")
    private TrialMode mode;

    @NotNull(message = "La catégorie de genre est obligatoire.")
    private CategoryGender categoryGender;

    @NotNull(message = "Le site est obligatoire.")
    private Long siteId;

    @NotNull(message = "La compétition est obligatoire.")
    private Long competitionId;

    @NotNull(message = "Le round est obligatoire.")
    private Long roundId;
}
