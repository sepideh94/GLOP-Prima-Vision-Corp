package com.ciblorgasport.trial.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.trial.domain.result.Result;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByTrialIdOrderByRankAsc(Long trialId);

    void deleteByTrialId(Long trialId);

    /** Résultats d'un participant direct (ATHLETE ou TEAM) via les IDs de TrialParticipant. */
    List<Result> findByTrialParticipantIdIn(List<Long> trialParticipantIds);
}
