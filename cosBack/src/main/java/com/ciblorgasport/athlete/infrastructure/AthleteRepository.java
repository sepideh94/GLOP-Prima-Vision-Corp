package com.ciblorgasport.athlete.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.athlete.domain.Athlete;

public interface AthleteRepository extends JpaRepository<Athlete, Long> {

    Optional<Athlete> findByEmail(String email);

    List<Athlete> findAllByOrderByLastNameAsc();

	boolean existsByEmail(String email);
}
