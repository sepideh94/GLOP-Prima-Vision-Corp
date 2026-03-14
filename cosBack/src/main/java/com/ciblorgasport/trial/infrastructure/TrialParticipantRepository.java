package com.ciblorgasport.trial.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.round.domain.RoundName;

public interface TrialParticipantRepository extends JpaRepository<TrialParticipant, Long> {

    List<TrialParticipant> findByTrialId(Long trialId);

    long countByTrialId(Long trialId);

    boolean existsByTrialIdAndAthleteId(Long trialId, Long athleteId);

    /**
     * Vérifie si un athlète est déjà assigné à une série de qualification
     * pour le même (trialName, categoryGender, competition).
     */
    @Query("""
        SELECT COUNT(tp) > 0 FROM TrialParticipant tp
        WHERE tp.athlete.id = :athleteId
        AND tp.trial.competition.id = :competitionId
        AND tp.trial.trialName = :trialName
        AND tp.trial.categoryGender = :categoryGender
        AND tp.trial.round.name = com.ciblorgasport.trial.round.domain.RoundName.QUALIFICATION_HEAT
        AND tp.trial.cancelled = false
        """)
    boolean existsByAthleteInQualificationHeat(
        @Param("athleteId") Long athleteId,
        @Param("competitionId") Long competitionId,
        @Param("trialName") TrialName trialName,
        @Param("categoryGender") CategoryGender categoryGender
    );

    /**
     * Récupère les athlètes distincts ayant participé à un round donné
     * pour un même (competition, trialName, categoryGender).
     * Utilisé pour déterminer les athlètes éligibles aux phases suivantes.
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
