package com.ciblorgasport.trial.infrastructure;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Component;

import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.input.SensorData;
import com.ciblorgasport.trial.domain.result.input.SensorDataReader;

import lombok.RequiredArgsConstructor;

/**
 * Implémentation simulée du port {@link SensorDataReader} pour les démonstrations.
 * <p>
 * Génère des performances aléatoires réalistes pour chaque participant d'une épreuve.
 * Les valeurs sont volontairement dispersées pour produire un classement varié.
 * <p>
 * Plages simulées :
 * <ul>
 *   <li>{@link PerformanceType#TIME}   : entre 9,50 s et 14,99 s (précision 2 décimales)</li>
 *   <li>{@link PerformanceType#POINTS} : entre 1,00 pt et 9,99 pts (précision 2 décimales)</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class SimulatedSensorDataReader implements SensorDataReader {

    private static final BigDecimal TIME_MIN   = new BigDecimal("9.50");
    private static final BigDecimal TIME_RANGE = new BigDecimal("5.50");   // → max 15.00 s

    private static final BigDecimal PTS_MIN    = new BigDecimal("1.00");
    private static final BigDecimal PTS_RANGE  = new BigDecimal("9.00");   // → max 10.00 pts

    private final TrialParticipantRepository participantRepository;
    private final Random random = new Random();

    /**
     * @param trialId identifiant de l'épreuve
     * @param performanceType type de performance attendu pour cette simulation
     */
    public List<SensorData> readForTrial(Long trialId, PerformanceType performanceType) {
        return participantRepository.findByTrialId(trialId)
                .stream()
                .map(tp -> new SensorData(tp.getId(), generateValue(performanceType)))
                .toList();
    }

    /**
     * Implémentation du port sans type (utilise TIME par défaut).
     * Préférer {@link #readForTrial(Long, PerformanceType)} pour la simulation.
     */
    @Override
    public List<SensorData> readForTrial(Long trialId) {
        return readForTrial(trialId, PerformanceType.TIME);
    }

    // -------------------------------------------------------------------------

    private BigDecimal generateValue(PerformanceType type) {
        double raw = random.nextDouble();
        return switch (type) {
            case TIME   -> TIME_MIN.add(TIME_RANGE.multiply(BigDecimal.valueOf(raw)))
                                   .setScale(2, RoundingMode.HALF_UP);
            case POINTS -> PTS_MIN.add(PTS_RANGE.multiply(BigDecimal.valueOf(raw)))
                                   .setScale(2, RoundingMode.HALF_UP);
        };
    }
}
