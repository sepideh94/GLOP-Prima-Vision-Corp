package com.ciblorgasport.trial.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.trial.domain.result.Result;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByTrialIdOrderByRankAsc(Long trialId);

    List<Result> findByTrialParticipantIdIn(List<Long> participantIds);

    @Modifying
    @Query("DELETE FROM Result r WHERE r.trial.id = :trialId")
    void deleteAllByTrialId(@Param("trialId") Long trialId);
}
