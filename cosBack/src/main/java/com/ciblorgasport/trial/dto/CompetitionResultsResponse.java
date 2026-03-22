package com.ciblorgasport.trial.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

/**
 * Resultats d'une epreuve dans le contexte d'une competition.
 * Utilise pour grouper les ResultResponse par epreuve
 * quand on consulte l'ensemble d'une competition.
 */
@Data
@Builder
public class CompetitionResultsResponse {

    private Long competitionId;
    private String competitionName;

    private Long trialId;
    private String trialName;
    private String categoryGender;
    private String roundName;

    /** Classement de cette epreuve, trie par rang. Vide si aucun resultat. */
    private List<ResultResponse> results;
}
