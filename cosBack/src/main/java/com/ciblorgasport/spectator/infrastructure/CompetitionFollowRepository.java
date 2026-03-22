package com.ciblorgasport.spectator.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.spectator.CompetitionFollow;

public interface CompetitionFollowRepository extends JpaRepository<CompetitionFollow, Long> {

    boolean existsByUser_IdAndCompetition_Id(Long userId, Long competitionId);

    Optional<CompetitionFollow> findByUser_IdAndCompetition_Id(Long userId, Long competitionId);

    void deleteByUser_IdAndCompetition_Id(Long userId, Long competitionId);

    @Query("SELECT cf FROM CompetitionFollow cf JOIN FETCH cf.user u WHERE cf.competition.id = :competitionId")
    List<CompetitionFollow> findByCompetitionIdWithUser(@Param("competitionId") Long competitionId);

    @Query("SELECT cf FROM CompetitionFollow cf JOIN FETCH cf.competition c LEFT JOIN FETCH c.parentEvent WHERE cf.user.id = :userId ORDER BY cf.createdAt DESC")
    List<CompetitionFollow> findByUserIdWithCompetitionOrderByCreatedAtDesc(@Param("userId") Long userId);
}
