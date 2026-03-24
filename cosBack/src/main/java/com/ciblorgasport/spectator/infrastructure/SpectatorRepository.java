package com.ciblorgasport.spectator.infrastructure;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.spectator.domain.Spectator;

public interface SpectatorRepository extends JpaRepository<Spectator, Long> {

    Optional<Spectator> findByEmail(String email);
}