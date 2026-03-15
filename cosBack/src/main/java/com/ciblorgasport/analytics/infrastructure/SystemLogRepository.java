package com.ciblorgasport.analytics.infrastructure;

import com.ciblorgasport.analytics.domain.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    // Compte le nombre d'actions d'un type précis (ex: "LOGIN") sur une période
    long countByActionTypeAndTimestampAfter(String actionType, LocalDateTime timestamp);

    // Récupère les logs récents pour l'affichage chronologique sur le dashboard de Marius
    List<SystemLog> findTop10ByOrderByTimestampDesc();

    //pour compter les actions par jour (pour les graphiques)
    @Query("SELECT COUNT(s) FROM SystemLog s WHERE s.actionType = :type AND s.timestamp >= :start AND s.timestamp <= :end")
    long countActionsInRange(@Param("type") String type, 
                             @Param("start") LocalDateTime start, 
                             @Param("end") LocalDateTime end);
}