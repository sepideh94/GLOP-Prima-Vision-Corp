package com.ciblorgasport.trial.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.RecordTrialResultsUseCase;
import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.input.SensorResultInputStrategy;
import com.ciblorgasport.trial.dto.RecordResultsRequest;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.trial.infrastructure.SimulatedSensorDataReader;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.user.domain.UserAccount;

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
    private final SimulatedSensorDataReader simulatedSensorDataReader;
    private final TrialParticipantRepository trialParticipantRepository;

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
        return ResponseEntity.ok(trialResultService.getResultsByTrialId(trialId));
    }

    /**
     * Modifie les résultats d'une épreuve déjà enregistrée.
     * <p>
     * Autorisé uniquement le jour de l'épreuve (comparaison sur endDate == today).
     * L'auteur de la modification est tracé automatiquement.
     *
     * @throws com.ciblorgasport.trial.domain.exception.ResultModificationNotAllowedException
     *         si la date de l'épreuve est dépassée
     */
    @PutMapping("/{id}/results")
    public ResponseEntity<List<ResultResponse>> updateResults(
            @PathVariable("id") Long trialId,
            @Valid @RequestBody RecordResultsRequest request,
            @AuthenticationPrincipal UserAccount commissioner) {

        recordTrialResultsUseCase.updateManual(
                trialId, request.results(), request.performanceType(), commissioner);
        return ResponseEntity.ok(trialResultService.getResultsByTrialId(trialId));
    }

    /**
     * Simule la réception de données capteur pour une épreuve terminée.
     * Génère des performances aléatoires pour chaque participant assigné,
     * calcule le classement et retourne les résultats.
     * <p>
     * Utilisation : démos et tests d'intégration.
     *
     * @param trialId         identifiant de l'épreuve (doit être COMPLETED)
     * @param performanceType TIME ou POINTS (défaut : TIME)
     */
    @PostMapping("/{id}/simulate-results")
    public ResponseEntity<List<ResultResponse>> simulateSensorResults(
            @PathVariable("id") Long trialId,
            @RequestParam(defaultValue = "TIME") PerformanceType performanceType) {

        var participants = trialParticipantRepository.findByTrialId(trialId);

        SensorResultInputStrategy strategy = new SensorResultInputStrategy(
                id -> simulatedSensorDataReader.readForTrial(id, performanceType),
                participants,
                performanceType);

        recordTrialResultsUseCase.execute(trialId, strategy);
        return ResponseEntity.ok(trialResultService.getResultsByTrialId(trialId));
    }
}
