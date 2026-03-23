package com.ciblorgasport.athlete.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

/**
 * Endpoints permettant a un athlete de consulter ses performances et celles de ses compétiteurs
 * (memes epreuves / series).
 * Acces restreint au role ATHLETE (cf. SecurityConfig : /api/athlete/**).
 */
@RestController
@RequestMapping("/api/athlete/results")
@RequiredArgsConstructor
public class AthleteResultsController {

    private final TrialResultService trialResultService;

    /**
     * Retourne toutes les performances de l'athlete connecte,
     * qu'il ait participe en individuel ou via une equipe.
     */
    @GetMapping
    public ResponseEntity<List<ResultResponse>> getMyResults(
            @AuthenticationPrincipal UserAccount user) {

        return ResponseEntity.ok(trialResultService.getResultsByAthleteId(user.getId()));
    }

    /**
     * Performances des autres participants aux epreuves auxquelles l'athlete connecte a pris part
     * (individuellement ou en equipe), sans inclure ses propres resultats.
     */
    @GetMapping("/competitors")
    public ResponseEntity<List<ResultResponse>> getCompetitorResults(
            @AuthenticationPrincipal UserAccount user) {

        return ResponseEntity.ok(trialResultService.getCompetitorResultsByAthleteId(user.getId()));
    }
}
