package com.ciblorgasport.team.infrastructure;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ciblorgasport.team.domain.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    /**
     * Recherche une équipe par son nom exact.
     * Utile pour vérifier si une équipe existe déjà lors d'un import.
     */
    Optional<Team> findByName(String name);
}