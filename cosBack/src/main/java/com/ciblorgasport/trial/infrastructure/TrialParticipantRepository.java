package com.ciblorgasport.trial.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ciblorgasport.athlete.domain.Athlete;
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

    // Correction : Utilisation de competitorId et competitorType
    boolean existsByTrialIdAndCompetitorIdAndCompetitorType(Long trialId, Long competitorId, CompetitorType competitorType);

    /**
     * Vérifie si un athlète est déjà inscrit dans une série de qualification pour une épreuve donnée.
     */
    @Query("SELECT COUNT(tp) > 0 FROM TrialParticipant tp " +
           "WHERE tp.competitorId = :athleteId " +
           "AND tp.competitorType = 'ATHLETE' " + // On force le type ATHLETE
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

    /**
     * Récupère les IDs des compétiteurs qualifiés depuis le tour précédent.
     */
    @Query("""
        SELECT DISTINCT tp.athlete FROM TrialParticipant tp
        WHERE tp.trial.competition = :competition
        AND tp.trial.trialName = :trialName
        AND tp.trial.categoryGender = :categoryGender
        AND tp.trial.round.name = :roundName
        AND tp.trial.cancelled = false
        """)
    List<Athlete> findAthletesByPreviousRound(
        @Param("competition") Competition competition,
        @Param("trialName") TrialName trialName,
        @Param("categoryGender") CategoryGender categoryGender,
        @Param("roundName") RoundName roundName
    );
    
    List<TrialParticipant> findByAthleteId(Long athleteId);
}
