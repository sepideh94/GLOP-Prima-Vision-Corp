package com.ciblorgasport.trial.infrastructure;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialMode;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;

public interface TrialRepository extends JpaRepository<Trial, Long> {

    List<Trial> findByCompetition(Competition competition);

    @Query("""
        SELECT DISTINCT t FROM Trial t
        LEFT JOIN FETCH t.site
        LEFT JOIN FETCH t.competition
        LEFT JOIN FETCH t.round
        WHERE t.competition.id = :competitionId
        """)
    List<Trial> findByCompetitionId(@Param("competitionId") Long competitionId);

    @Query("""
        SELECT DISTINCT t FROM Trial t
        LEFT JOIN FETCH t.site
        LEFT JOIN FETCH t.competition
        LEFT JOIN FETCH t.round
        """)
    List<Trial> findAllWithAssociations();

    @Query("""
        SELECT DISTINCT t FROM Trial t
        LEFT JOIN FETCH t.site
        LEFT JOIN FETCH t.competition
        LEFT JOIN FETCH t.round
        WHERE t.id = :id
        """)
    Optional<Trial> findOneWithAssociationsById(@Param("id") Long id);

    /**
     * Récupère le roundNumber maximum pour les séries d'un même type.
     * Retourne null si aucune série n'existe encore.
     */
    @Query("""
        SELECT MAX(t.roundNumber) FROM Trial t
        WHERE t.competition = :competition
        AND t.trialName = :trialName
        AND t.categoryGender = :categoryGender
        AND t.mode = :mode
        AND t.round = :round
        """)
    Integer findMaxRoundNumber(
        @Param("competition") Competition competition,
        @Param("trialName") TrialName trialName,
        @Param("categoryGender") CategoryGender categoryGender,
        @Param("mode") TrialMode mode,
        @Param("round") Round round);

    /**
     * Récupère les trials actifs (non annulés) pour un round donné.
     * Utilisé pour la validation temporelle des demi-finales et finales.
     */
    @Query("""
        SELECT t FROM Trial t
        WHERE t.competition = :competition
        AND t.trialName = :trialName
        AND t.categoryGender = :categoryGender
        AND t.round.name = :roundName
        AND t.cancelled = false
        """)
    List<Trial> findActiveByCompetitionAndTrialNameAndCategoryGenderAndRoundName(
        @Param("competition") Competition competition,
        @Param("trialName") TrialName trialName,
        @Param("categoryGender") CategoryGender categoryGender,
        @Param("roundName") RoundName roundName);
    
    @Query("""
        SELECT DISTINCT t FROM Trial t
        LEFT JOIN FETCH t.site
        LEFT JOIN FETCH t.competition
        LEFT JOIN FETCH t.round
        WHERE t.site.id = :siteId
        AND t.cancelled = false
        AND (
            (t.startDate = :startDate AND t.startHour >= :startHour)
            OR (t.startDate > :startDate AND t.startDate < :endDate)
            OR (t.startDate = :endDate AND t.startHour <= :endHour)
        )
        """)
    List<Trial> findBySiteAndPeriod(
            @Param("siteId") Long siteId,
            @Param("startDate") LocalDate startDate,
            @Param("startHour") LocalTime startHour,
            @Param("endDate") LocalDate endDate,
            @Param("endHour") LocalTime endHour);
}
