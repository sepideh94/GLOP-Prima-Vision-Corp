package com.ciblorgasport.competition.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    /** Participation has @ManyToOne Competition, so query by competition's id: Competition_Id */
    List<Participation> findByCompetition_Id(Long competitionId);

    List<Participation> findByCompetitorIdAndCompetitorType(Long competitorId, CompetitorType competitorType);

    boolean existsByCompetition_IdAndCompetitorIdAndCompetitorType(
            Long competitionId, Long competitorId, CompetitorType competitorType);

    Optional<Participation> findByCompetitionIdAndCompetitorIdAndCompetitorType(Long competitionId, Long competitorId, CompetitorType competitorType);
    boolean existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
            Long competitionId, Long competitorId, CompetitorType competitorType, ParticipationStatus status);

    boolean existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatusIn(
            Long competitionId, Long competitorId, CompetitorType competitorType, List<ParticipationStatus> statuses);

    @Query("SELECT DISTINCT p.competition FROM Participation p " +
    	       "WHERE (p.competitorId = :athleteId AND p.competitorType = 'ATHLETE') " +
    	       "OR (p.competitorType = 'TEAM' AND p.competitorId IN " +
    	       "    (SELECT t.id FROM Team t JOIN t.members m WHERE m.id = :athleteId))")
    	List<Competition> findAllCompetitionsByAthleteId(@Param("athleteId") Long athleteId);

    Optional<Participation> findByCompetition_IdAndCompetitorIdAndCompetitorType(
            Long competitionId, Long competitorId, CompetitorType competitorType);
    
    @Query("SELECT p FROM Participation p " +
    	       "WHERE (p.competitorId = :athleteId AND p.competitorType = 'ATHLETE') " +
    	       "OR (p.competitorType = 'TEAM' AND p.competitorId IN " +
    	       "    (SELECT t.id FROM Team t JOIN t.members m WHERE m.id = :athleteId))")
    	List<Participation> findAllDirectAndTeamParticipations(@Param("athleteId") Long athleteId);
}
