package com.ciblorgasport.competition.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

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
}
