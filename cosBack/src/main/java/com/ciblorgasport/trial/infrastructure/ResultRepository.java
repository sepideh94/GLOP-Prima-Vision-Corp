package com.ciblorgasport.trial.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.round.domain.RoundName;

public interface ResultRepository extends JpaRepository<Result, Long> {

    long countByTrial_Id(Long trialId);

    List<Result> findByTrialIdOrderByRankAsc(Long trialId);

    List<Result> findByTrialParticipantIdIn(List<Long> participantIds);

    @Modifying
    @Query("DELETE FROM Result r WHERE r.trial.id = :trialId")
    void deleteAllByTrialId(@Param("trialId") Long trialId);

    /**
     * Récupère tous les résultats d'un round (toutes séries confondues) pour une
     * même compétition, épreuve et catégorie. Utilisé pour calculer le classement
     * global inter-séries et déterminer les qualifiés vers la phase suivante.
     */
    @Query("SELECT r FROM Result r " +
           "JOIN FETCH r.trialParticipant tp " +
           "WHERE r.trial.competition = :competition " +
           "AND r.trial.trialName = :trialName " +
           "AND r.trial.categoryGender = :categoryGender " +
           "AND r.trial.round.name = :roundName " +
           "AND r.trial.cancelled = false")
    List<Result> findResultsForRound(
            @Param("competition") Competition competition,
            @Param("trialName") TrialName trialName,
            @Param("categoryGender") CategoryGender categoryGender,
            @Param("roundName") RoundName roundName);
}
