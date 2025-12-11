package com.ciblorgasport.round.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.round.domain.Round;

public interface RoundRepository extends JpaRepository<Round, Long> {

}
