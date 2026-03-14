package com.ciblorgasport.team.infrastructure;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ciblorgasport.team.domain.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    /**
     * Recherche une équipe par son nom exact.
     * Utile pour vérifier si une équipe existe déjà lors d'un import.
     */
    Optional<Team> findByName(String name);
    
    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.id = :athleteId")
    List<Team> findAllByMemberId(@Param("athleteId") Long athleteId);
}