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

 /// Compte par type d'acteur (en utilisant la colonne user_type de la table user_account)
    @Query(value = "SELECT u.user_type, COUNT(s.id) FROM system_logs s " +
            "JOIN user_account u ON s.username = u.email " +
            "WHERE s.action_type = 'LOGIN' AND s.timestamp > :since " +
            "GROUP BY u.user_type", nativeQuery = true)
     List<Object[]> countLoginsByRole(LocalDateTime since);

     // Sections consultées
     @Query(value = "SELECT details, COUNT(*) as cnt FROM system_logs " +
            "WHERE action_type = 'VIEW_DATA' AND timestamp > :since " +
            "GROUP BY details ORDER BY cnt DESC LIMIT 5", nativeQuery = true)
     List<Object[]> findMostViewedData(LocalDateTime since);

     // Sessions pour le calcul de durée
     @Query(value = "SELECT username, MIN(timestamp), MAX(timestamp) FROM system_logs " +
            "WHERE timestamp > :since GROUP BY username, CAST(timestamp AS DATE)", nativeQuery = true)
     List<Object[]> findUserSessions(LocalDateTime since);
     

  @Query(value = "SELECT EXTRACT(HOUR FROM timestamp) as hr, COUNT(*) FROM system_logs " +
         "WHERE timestamp > CURRENT_DATE GROUP BY hr ORDER BY hr", nativeQuery = true)
  List<Object[]> findHourlyTraffic();

  @Query(value = "SELECT u.user_type, s.username, MIN(s.timestamp), MAX(s.timestamp) FROM system_logs s " +
         "JOIN user_account u ON s.username = u.email " +
         "WHERE s.timestamp > :since " +
         "GROUP BY u.user_type, s.username, CAST(s.timestamp AS DATE)", nativeQuery = true)
  List<Object[]> findUserSessionsWithRole(LocalDateTime since);

}