package com.ciblorgasport.trial.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.trial.infrastructure.ResultRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service exposant les résultats classés d'une épreuve.
 * <p>
 * La résolution du nom d'affichage (athlète ou équipe + membres) est déléguée
 * à {@link TrialParticipantService#getByTrialId} afin de ne pas dupliquer
 * la logique de mappage athlète/équipe déjà présente dans
 * {@link TrialParticipantServiceImpl}.
 */
@Service
@RequiredArgsConstructor
public class TrialResultServiceImpl implements TrialResultService {

    private final ResultRepository resultRepository;
    private final TrialParticipantService trialParticipantService;

    @Override
    @Transactional(readOnly = true)
    public List<ResultResponse> getResultsByTrialId(Long trialId) {
        List<Result> results = resultRepository.findByTrialIdOrderByRankAsc(trialId);

        // Index des participants enrichis (displayName + members) par leur ID
        var participantById = trialParticipantService.getByTrialId(trialId)
                .stream()
                .collect(java.util.stream.Collectors.toMap(p -> p.getId(), p -> p));

        return results.stream()
                .map(result -> {
                    var participant = participantById.get(result.getTrialParticipant().getId());
                    return ResultResponse.from(result, participant);
                })
                .toList();
    }
}
