package com.ciblorgasport.trial.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.dto.CompetitionResultsResponse;
import com.ciblorgasport.trial.dto.PublicCompetitionSummaryResponse;
import com.ciblorgasport.trial.dto.ResultResponse;

import lombok.RequiredArgsConstructor;

/**
 * Lecture publique des résultats (et donc du classement).
 * <p>
 * Important : la réponse contient le champ `rank` déjà calculé côté back.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicResultsController {

    private final TrialResultService trialResultService;

    /**
     * Classement d'une épreuve (trial) pour le grand public.
     */
    @GetMapping("/trials/{id}/results")
    public ResponseEntity<List<ResultResponse>> getResultsByTrial(
            @PathVariable("id") Long trialId) {
        return ResponseEntity.ok(trialResultService.getResultsByTrialId(trialId));
    }

    /**
     * Résultats classés de toutes les épreuves d'une compétition.
     */
    @GetMapping("/competitions/{id}/results")
    public ResponseEntity<List<CompetitionResultsResponse>> getResultsByCompetition(
            @PathVariable("id") Long competitionId) {
        return ResponseEntity.ok(trialResultService.getResultsByCompetitionId(competitionId));
    }

    /**
     * Liste les competitions qui disposent deja de resultats publics.
     */
    @GetMapping("/competitions/with-results")
    public ResponseEntity<List<PublicCompetitionSummaryResponse>> getCompetitionsWithResults() {
        return ResponseEntity.ok(trialResultService.getPublicCompetitionsWithResults());
    }
}

