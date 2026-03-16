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
 * Collecte les résultats depuis une saisie manuelle du commissaire.
 */
@RequiredArgsConstructor
public class ManualResultInputStrategy implements ResultInputStrategy {

    private final List<ResultInputDto> inputs;
    private final List<TrialParticipant> participants;
    private final PerformanceType performanceType;

    @Override
    public List<Result> collect(Trial trial) {
        Map<Long, TrialParticipant> participantById = participants.stream()
                .collect(Collectors.toMap(TrialParticipant::getId, Function.identity()));

        return inputs.stream()
                .map(input -> {
                    TrialParticipant tp = participantById.get(input.trialParticipantId());
                    if (tp == null) {
                        throw new EntityNotFoundException(
                                "Participant introuvable avec l'ID: " + input.trialParticipantId());
                    }
                    return Result.builder()
                            .trial(trial)
                            .trialParticipant(tp)
                            .performanceType(performanceType)
                            .performanceValue(input.performanceValue())
                            .build();
                })
                .toList();
    }
}
