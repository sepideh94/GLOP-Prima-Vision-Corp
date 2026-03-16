package com.ciblorgasport.trial.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.RecordTrialResultsUseCase;
import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.dto.RecordResultsRequest;
import com.ciblorgasport.trial.dto.ResultResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Endpoints commissaire pour les résultats d'épreuves.
 * Accès restreint au rôle COMMISSIONNER (cf. SecurityConfig).
 */
@RestController
@RequestMapping("/api/commissioner/trials")
@RequiredArgsConstructor
public class CommissionerTrialController {

    private final RecordTrialResultsUseCase recordTrialResultsUseCase;
    private final TrialResultService trialResultService;

    /**
     * Enregistre les résultats d'une épreuve terminée et calcule le classement.
     * Fonctionne indifféremment pour les épreuves individuelles et par équipes :
     * les {@code trialParticipantId} dans la requête désignent des TrialParticipant
     * dont le type (ATHLETE ou TEAM) est déjà stocké en base.
     */
    @PostMapping("/{id}/results")
    public ResponseEntity<List<ResultResponse>> recordResults(
            @PathVariable("id") Long trialId,
            @Valid @RequestBody RecordResultsRequest request) {

        recordTrialResultsUseCase.recordManual(trialId, request.results(), request.performanceType());
        List<ResultResponse> ranked = trialResultService.getResultsByTrialId(trialId);
        return ResponseEntity.ok(ranked);
    }
}
