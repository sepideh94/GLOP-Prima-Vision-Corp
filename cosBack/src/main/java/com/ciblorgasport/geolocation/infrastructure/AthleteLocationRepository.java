package com.ciblorgasport.geolocation.infrastructure;

import com.ciblorgasport.geolocation.domain.AthleteLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AthleteLocationRepository extends JpaRepository<AthleteLocation, Long> {

    Optional<AthleteLocation> findByAthleteId(Long athleteId);
}
