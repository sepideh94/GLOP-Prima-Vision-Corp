package com.ciblorgasport.trial.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.round.domain.RoundName;

@Repository
public interface TrialParticipantRepository extends JpaRepository<TrialParticipant, Long> {

    List<TrialParticipant> findByTrialId(Long trialId);

    long countByTrialId(Long trialId);

    boolean existsByTrialIdAndCompetitorIdAndCompetitorType(Long trialId, Long competitorId, CompetitorType competitorType);

    @Query("""
        SELECT tp
        FROM TrialParticipant tp
        WHERE tp.id = :id
          AND (
                (tp.competitorType = com.ciblorgasport.competition.domain.CompetitorType.ATHLETE
                 AND tp.competitorId = :athleteId)
             OR (tp.competitorType = com.ciblorgasport.competition.domain.CompetitorType.TEAM
                 AND tp.competitorId IN (
                        SELECT t.id
                        FROM Team t
                        JOIN t.members m
                        WHERE m.id = :athleteId
                 ))
          )
    """)
    Optional<TrialParticipant> findAccessibleByIdForAthlete(
            @Param("id") Long id,
            @Param("athleteId") Long athleteId
    );

    @Query("SELECT tp FROM TrialParticipant tp " +
           "WHERE tp.competitorId = :athleteId " +
           "AND tp.competitorType = 'ATHLETE'")
    List<TrialParticipant> findByAthleteId(@Param("athleteId") Long athleteId);

    @Query("SELECT COUNT(tp) > 0 FROM TrialParticipant tp " +
           "WHERE tp.competitorId = :athleteId " +
           "AND tp.competitorType = 'ATHLETE' " +
           "AND tp.trial.competition.id = :competitionId " +
           "AND tp.trial.trialName = :trialName " +
           "AND tp.trial.categoryGender = :categoryGender " +
           "AND tp.trial.round.name = com.ciblorgasport.trial.round.domain.RoundName.QUALIFICATION_HEAT " +
           "AND tp.trial.cancelled = false")
    boolean existsByAthleteInQualificationHeat(
            @Param("athleteId") Long athleteId,
            @Param("competitionId") Long competitionId,
            @Param("trialName") TrialName trialName,
            @Param("categoryGender") CategoryGender categoryGender);

    @Query("SELECT DISTINCT tp.competitorId FROM TrialParticipant tp " +
           "WHERE tp.trial.competition = :competition " +
           "AND tp.trial.trialName = :trialName " +
           "AND tp.trial.categoryGender = :categoryGender " +
           "AND tp.trial.round.name = :roundName " +
           "AND tp.trial.cancelled = false")
    List<Long> findQualifiedCompetitorIds(
            @Param("competition") Competition competition,
            @Param("trialName") TrialName trialName,
            @Param("categoryGender") CategoryGender categoryGender,
            @Param("roundName") RoundName roundName);

    List<TrialParticipant> findByCompetitorId(Long competitorId);

    @Query("SELECT tp FROM TrialParticipant tp " +
           "WHERE (tp.competitorId = :athleteId AND tp.competitorType = 'ATHLETE') " +
           "OR (tp.competitorType = 'TEAM' AND tp.competitorId IN " +
           "    (SELECT t.id FROM Team t JOIN t.members m WHERE m.id = :athleteId))")
    List<TrialParticipant> findAllDirectAndTeamTrialParticipations(@Param("athleteId") Long athleteId);
}