package com.ciblorgasport.competition.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ciblorgasport.competition.domain.Competition;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
}