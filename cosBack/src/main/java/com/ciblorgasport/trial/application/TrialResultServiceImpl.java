package com.ciblorgasport.trial.application;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Comparator;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.dto.CompetitionResultsResponse;
import com.ciblorgasport.trial.dto.PublicCompetitionSummaryResponse;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.trial.infrastructure.ResultRepository;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;

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
    private final TrialParticipantRepository trialParticipantRepository;
    private final TrialRepository trialRepository;
    private final CompetitionRepository competitionRepository;

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

    @Override
    @Transactional(readOnly = true)
    public List<ResultResponse> getResultsByAthleteId(Long athleteId) {
        // Recupere toutes les participations : directe (ATHLETE) + via equipe (TEAM)
        var participations = trialParticipantRepository.findAllDirectAndTeamTrialParticipations(athleteId);
        if (participations.isEmpty()) return List.of();

        List<Long> participantIds = participations.stream()
                .map(tp -> tp.getId())
                .toList();

        List<Result> results = resultRepository.findByTrialParticipantIdIn(participantIds);

        var participantById = participations.stream()
                .collect(Collectors.toMap(tp -> tp.getId(), tp -> tp));

        return results.stream()
                .map(result -> {
                    var tp = participantById.get(result.getTrialParticipant().getId());
                    var participantResponse = trialParticipantService.toResponse(tp);
                    return ResultResponse.from(result, participantResponse);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResultResponse> getCompetitorResultsByAthleteId(Long athleteId) {
        List<TrialParticipant> myParticipations =
                trialParticipantRepository.findAllDirectAndTeamTrialParticipations(athleteId);
        if (myParticipations.isEmpty()) {
            return List.of();
        }

        Set<Long> myParticipantIds = myParticipations.stream()
                .map(TrialParticipant::getId)
                .collect(Collectors.toSet());
        Set<Long> trialIds = myParticipations.stream()
                .map(tp -> tp.getTrial().getId())
                .collect(Collectors.toSet());

        Set<Long> competitorParticipantIds = new HashSet<>();
        for (Long trialId : trialIds) {
            for (TrialParticipant tp : trialParticipantRepository.findByTrialId(trialId)) {
                if (!myParticipantIds.contains(tp.getId())) {
                    competitorParticipantIds.add(tp.getId());
                }
            }
        }
        if (competitorParticipantIds.isEmpty()) {
            return List.of();
        }

        List<Result> results =
                resultRepository.findByTrialParticipantIdIn(new ArrayList<>(competitorParticipantIds));
        var participantById = trialParticipantRepository.findAllById(competitorParticipantIds).stream()
                .collect(Collectors.toMap(TrialParticipant::getId, tp -> tp));

        return results.stream()
                .map(result -> {
                    TrialParticipant tp = participantById.get(result.getTrialParticipant().getId());
                    if (tp == null) {
                        return null;
                    }
                    var participantResponse = trialParticipantService.toResponse(tp);
                    return ResultResponse.from(result, participantResponse);
                })
                .filter(Objects::nonNull)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionResultsResponse> getResultsByCompetitionId(Long competitionId) {
        List<Trial> trials = trialRepository.findByCompetitionId(competitionId);

        return trials.stream()
                .map(trial -> {
                    List<ResultResponse> results = getResultsByTrialId(trial.getId());
                    return CompetitionResultsResponse.builder()
                            .competitionId(competitionId)
                            .competitionName(
                                    trial.getCompetition() != null ? trial.getCompetition().getName() : null
                            )
                            .trialId(trial.getId())
                            .trialName(trial.getTrialName() != null ? trial.getTrialName().name() : null)
                            .categoryGender(trial.getCategoryGender() != null ? trial.getCategoryGender().name() : null)
                            .roundName(trial.getRound() != null ? trial.getRound().getName().name() : null)
                            .startDate(trial.getStartDate())
                            .startHour(trial.getStartHour())
                            .endDate(trial.getEndDate())
                            .endHour(trial.getEndHour())
                            .results(results)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicCompetitionSummaryResponse> getPublicCompetitionsWithResults() {
        return competitionRepository.findAll().stream()
                .map(competition -> {
                    List<CompetitionResultsResponse> grouped = getResultsByCompetitionId(competition.getId());
                    var allResults = grouped.stream()
                            .flatMap(g -> g.getResults().stream())
                            .toList();

                    if (allResults.isEmpty()) {
                        return null;
                    }

                    var latest = allResults.stream()
                            .map(ResultResponse::getUpdatedAt)
                            .filter(java.util.Objects::nonNull)
                            .max(Comparator.naturalOrder())
                            .orElse(null);

                    return PublicCompetitionSummaryResponse.builder()
                            .competitionId(competition.getId())
                            .competitionName(competition.getName())
                            .lastUpdatedAt(latest)
                            .trialGroups(grouped)
                            .build();
                })
                .filter(java.util.Objects::nonNull)
                .sorted((a, b) -> {
                    if (a.getLastUpdatedAt() == null && b.getLastUpdatedAt() == null) return 0;
                    if (a.getLastUpdatedAt() == null) return 1;
                    if (b.getLastUpdatedAt() == null) return -1;
                    return b.getLastUpdatedAt().compareTo(a.getLastUpdatedAt());
                })
                .toList();
    }
}
