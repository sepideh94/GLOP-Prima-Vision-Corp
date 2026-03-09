package com.ciblorgasport.trial.round.infrastructure;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;

public interface RoundRepository extends JpaRepository<Round, Long> {

    Optional<Round> findByName(RoundName name);
}
