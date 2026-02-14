package com.ciblorgasport.competition.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    List<Participation> findByCompetitionId(Long competitionId);

    List<Participation> findByCompetitorIdAndCompetitorType(Long competitorId, CompetitorType competitorType);

    boolean existsByCompetitionIdAndCompetitorIdAndCompetitorType(
            Long competitionId, Long competitorId, CompetitorType competitorType);
    
    Optional<Participation> findByCompetitionIdAndCompetitorIdAndCompetitorType(Long competitionId, Long competitorId, CompetitorType competitorType);
}
