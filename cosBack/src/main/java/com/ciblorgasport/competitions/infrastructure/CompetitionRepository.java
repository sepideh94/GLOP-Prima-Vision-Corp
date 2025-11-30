package com.ciblorgasport.competitions.infrastructure;


import org.springframework.data.jpa.repository.JpaRepository;
import com.ciblorgasport.competitions.domain.Competition;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
}