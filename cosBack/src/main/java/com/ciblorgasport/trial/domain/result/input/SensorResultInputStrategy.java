package com.ciblorgasport.trial.domain.result.input;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.Result;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * Collecte les résultats depuis un capteur via le port {@link SensorDataReader}.
 * Le use case ne sait pas si les données viennent d'un fichier JSON,
 * d'un endpoint simulé ou d'un vrai capteur : seule l'implémentation de
 * {@link SensorDataReader} change.
 */
@RequiredArgsConstructor
public class SensorResultInputStrategy implements ResultInputStrategy {

    private final SensorDataReader sensorReader;
    private final List<TrialParticipant> participants;
    private final PerformanceType performanceType;

    @Override
    public List<Result> collect(Trial trial) {
        List<SensorData> sensorData = sensorReader.readForTrial(trial.getId());

        Map<Long, TrialParticipant> participantById = participants.stream()
                .collect(Collectors.toMap(TrialParticipant::getId, Function.identity()));

        return sensorData.stream()
                .map(data -> {
                    TrialParticipant tp = participantById.get(data.trialParticipantId());
                    if (tp == null) {
                        throw new EntityNotFoundException(
                                "Participant introuvable avec l'ID: " + data.trialParticipantId());
                    }
                    return Result.builder()
                            .trial(trial)
                            .trialParticipant(tp)
                            .performanceType(performanceType)
                            .performanceValue(data.performanceValue())
                            .build();
                })
                .toList();
    }
}
