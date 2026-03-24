package com.ciblorgasport.trial.application;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.exception.TrialNotFoundException;
import com.ciblorgasport.trial.domain.exception.TrialNotCompletedException;
import com.ciblorgasport.trial.domain.ranking.RankingService;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.domain.result.input.ManualResultInputStrategy;
import com.ciblorgasport.trial.domain.result.input.ResultInputDto;
import com.ciblorgasport.trial.domain.result.input.ResultInputStrategy;
import com.ciblorgasport.notification.application.CompetitionResultsNotificationService;
import com.ciblorgasport.trial.infrastructure.ResultRepository;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * Use case : enregistrer les résultats d'une épreuve et calculer le classement.
 * <p>
 * Règles de gestion vérifiées :
 * <ul>
 *   <li>L'épreuve doit avoir le statut {@link Status#COMPLETED} — sinon {@link TrialNotCompletedException}</li>
 *   <li>Seul un commissaire peut appeler ce use case — garanti par Spring Security sur {@code /api/commissioner/**}</li>
 * </ul>
 *
 * Exemple d'utilisation avec saisie manuelle :
 * <pre>
 *   List&lt;ResultInputDto&gt; inputs = List.of(
 *       new ResultInputDto(1L, new BigDecimal("10.01")),
 *       new ResultInputDto(2L, new BigDecimal("10.01")),
 *       new ResultInputDto(3L, new BigDecimal("10.05"))
 *   );
 *   List&lt;Result&gt; results = useCase.recordManual(trialId, inputs, PerformanceType.TIME);
 *   // résultats : rang 1 (10.01s, tie), rang 1 (10.01s, tie), rang 3 (10.05s)
 * </pre>
 */
@Service
@RequiredArgsConstructor
public class RecordTrialResultsUseCase {

    private final TrialRepository              trialRepository;
    private final TrialParticipantRepository   trialParticipantRepository;
    private final ResultRepository             resultRepository;
    private final RankingService               rankingService;
    private final CompetitionResultsNotificationService competitionResultsNotificationService;

    /**
     * Enregistre les résultats depuis une saisie manuelle du commissaire.
     */
    @Transactional
    public List<Result> recordManual(Long trialId, List<ResultInputDto> inputs, PerformanceType performanceType) {
        Trial trial = loadCompletedTrialOrThrow(trialId);
        List<TrialParticipant> participants = trialParticipantRepository.findByTrialId(trialId);
        ResultInputStrategy strategy = new ManualResultInputStrategy(inputs, participants, performanceType);
        return rankAndSave(trial, strategy, false);
    }

    /**
     * Modifie les résultats d'une épreuve terminée (reset complet + recalcul du classement).
     * <p>
     * Règles vérifiées :
     * <ul>
     *   <li>L'épreuve doit être {@link Status#COMPLETED}</li>
     *   <li>La date de fin de l'épreuve doit être aujourd'hui</li>
     * </ul>
     *
     * @param updatedBy prénom + nom du commissaire connecté (pour l'audit)
     */
    @Transactional
    public List<Result> updateManual(Long trialId, List<ResultInputDto> inputs,
                                     PerformanceType performanceType, String updatedBy) {
        Trial trial = loadCompletedTrialOrThrow(trialId);

        if (!LocalDate.now().equals(trial.getEndDate())) {
            throw new IllegalStateException(
                    "La modification des résultats n'est autorisée que le jour même de l'épreuve.");
        }

        resultRepository.deleteAllByTrialId(trialId);

        List<TrialParticipant> participants = trialParticipantRepository.findByTrialId(trialId);
        ResultInputStrategy strategy = new ManualResultInputStrategy(inputs, participants, performanceType);

        List<Result> rawResults = strategy.collect(trial);
        List<Result> ranked     = rankingService.rank(rawResults);

        LocalDateTime now = LocalDateTime.now();
        ranked.forEach(r -> {
            r.setUpdatedBy(updatedBy);
            r.setUpdatedAt(now);
        });

        List<Result> saved = resultRepository.saveAll(ranked);
        if (!saved.isEmpty()) {
            competitionResultsNotificationService.notifyFollowers(trial, true);
        }
        return saved;
    }

    /**
     * Enregistre les résultats depuis une source externe (capteur, simulation...).
     */
    @Transactional
    public List<Result> execute(Long trialId, ResultInputStrategy inputStrategy) {
        Trial trial = loadCompletedTrialOrThrow(trialId);
        return rankAndSave(trial, inputStrategy, false);
    }

    // -------------------------------------------------------------------------

    private Trial loadCompletedTrialOrThrow(Long trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new TrialNotFoundException(trialId));

        if (trial.getStatus() != Status.COMPLETED) {
            throw new TrialNotCompletedException(trialId, trial.getStatus());
        }

        return trial;
    }

    private List<Result> rankAndSave(Trial trial, ResultInputStrategy strategy, boolean forceResultsUpdatedNotification) {
        long countBefore = resultRepository.countByTrial_Id(trial.getId());
        List<Result> rawResults = strategy.collect(trial);
        List<Result> ranked     = rankingService.rank(rawResults);
        List<Result> saved = resultRepository.saveAll(ranked);
        if (!saved.isEmpty()) {
            boolean updated = forceResultsUpdatedNotification || countBefore > 0;
            competitionResultsNotificationService.notifyFollowers(trial, updated);
        }
        return saved;
    }
}
