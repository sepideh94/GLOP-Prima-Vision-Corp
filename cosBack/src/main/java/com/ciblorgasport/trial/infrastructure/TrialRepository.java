package com.ciblorgasport.trial.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;

public interface TrialRepository extends JpaRepository<Trial, Long> {

    List<Trial> findByCompetition(Competition competition);

    /**
     * Récupère le roundNumber maximum pour les séries d'un même type.
     * Retourne null si aucune série n'existe encore.
     */
    @Query("""
        SELECT MAX(t.roundNumber) FROM Trial t
        WHERE t.competition = :competition
        AND t.trialName = :trialName
        AND t.categoryGender = :categoryGender
        AND t.round = :round
        """)
    Integer findMaxRoundNumber(
        @Param("competition") Competition competition,
        @Param("trialName") TrialName trialName,
        @Param("categoryGender") CategoryGender categoryGender,
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
}
