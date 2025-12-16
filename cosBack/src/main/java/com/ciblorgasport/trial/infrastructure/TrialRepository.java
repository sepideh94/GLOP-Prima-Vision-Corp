package com.ciblorgasport.trial.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.trial.domain.Trial;

public interface TrialRepository extends JpaRepository<Trial, Long> {

    List<Trial> findByCompetition(Competition competition);
}
