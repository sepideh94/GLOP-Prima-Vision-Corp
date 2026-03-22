package com.ciblorgasport.trial.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.dto.CompetitionResultsResponse;

import lombok.RequiredArgsConstructor;

/**
 * Lecture publique des resultats groupes par epreuve pour une competition.
 * Acces : tout utilisateur authentifie (anyRequest().authenticated()).
 */
@RestController
@RequestMapping("/api/competitions")
@RequiredArgsConstructor
public class CompetitionResultsController {

    private final TrialResultService trialResultService;

    /**
     * Retourne les resultats de toutes les epreuves d'une competition,
     * groupes par epreuve et tries par rang.
     * Les epreuves sans resultat apparaissent avec une liste vide.
     */
    @GetMapping("/{id}/results")
    public ResponseEntity<List<CompetitionResultsResponse>> getResultsByCompetition(
            @PathVariable("id") Long competitionId) {

        return ResponseEntity.ok(trialResultService.getResultsByCompetitionId(competitionId));
    }
}
