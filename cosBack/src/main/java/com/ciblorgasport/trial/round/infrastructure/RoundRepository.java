package com.ciblorgasport.trial.round.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.trial.round.domain.Round;

public interface RoundRepository extends JpaRepository<Round, Long> {

}
