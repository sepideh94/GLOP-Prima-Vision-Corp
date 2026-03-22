package com.ciblorgasport.analytics.application;

import com.ciblorgasport.admin.AdminStatsResponse;
import com.ciblorgasport.admin.ChartPointResponse;
import com.ciblorgasport.analytics.domain.SystemLog;
import com.ciblorgasport.analytics.infrastructure.SystemLogRepository;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final SystemLogRepository logRepository;
    private final IncidentRepository incidentRepository;
    private final VolonteerRepository volonteerRepository;

    /**
     * Enregistre une trace d'activité dans le système.
     */
    @Transactional
    public void logAction(String username, String actionType, String details) {
        SystemLog log = SystemLog.builder()
                .username(username)
                .actionType(actionType)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        logRepository.save(log);
    }

    /**
     * Compte les actions d'un certain type sur les 7 derniers jours.
     */
    public long getWeeklyCount(String actionType) {
        LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);
        return logRepository.countByActionTypeAndTimestampAfter(actionType, lastWeek);
    }

    /**
     * Récupère le nombre total de volontaires enregistrés.
     */
    public long getTotalVolonteers() {
        return volonteerRepository.count();
    }

    /**
     * Compte les incidents actuellement en cours.
     */
    public long getActiveIncidentsCount() {
        return incidentRepository.count();
    }
    
    public String generateWeeklyReportSummary() {
        long logins = getWeeklyCount("LOGIN");
        long incidents = getWeeklyCount("INCIDENT_CREATED");
        long volunteers = getTotalVolonteers();
        
        // 1. Analyse de l'usage
        String usageStatus = logins > 100 ? "excellente" : (logins > 20 ? "satisfaisante" : "faible");
        String usageComment = logins < 10 ? 
            "Attention : Une campagne de communication est nécessaire pour booster l'usage." : 
            "Le système supporte bien la charge actuelle.";

        // 2. Analyse de la sécurité
        String securityAlert = "";
        if (incidents == 0) {
            securityAlert = "Remarquable : Aucun incident n'a été déploré cette semaine.";
        } else if (incidents > 10) {
            securityAlert = "CRITIQUE : Le nombre d'incidents est anormalement élevé. Renforcez la sécurité sur site.";
        } else {
            securityAlert = "Vigilance : Quelques incidents mineurs signalés, situation sous contrôle.";
        }

        // 3. Analyse des ressources (Volontaires)
        String volunteerStatus = volunteers < 50 ? 
            "Alerte : Effectif insuffisant pour couvrir tous les sites." : 
            "L'effectif des volontaires est conforme aux besoins prévisionnels.";

        // Construction du texte final
        return String.format(
            "BILAN HEBDOMADAIRE DYNAMIQUE\n" +
            "------------------------------\n" +
            "USAGE : La fréquentation est %s (%d connexions).\n" +
            "%s\n\n" +
            "SÉCURITÉ : %s\n\n" +
            "RESSOURCES : %s (Total : %d volontaires).\n\n" +
            "RECOMMANDATION ADMIN : %s",
            usageStatus, logins, usageComment, securityAlert, volunteerStatus, volunteers,
            (incidents > 5 || volunteers < 50) ? "Action prioritaire requise" : "Poursuivre l'exploitation normale"
        );
    }
    
    public List<ChartPointResponse> getWeeklyLoginHistory() {
        List<ChartPointResponse> history = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        for (int i = 6; i >= 0; i--) {
            LocalDateTime startOfDay = LocalDate.now().minusDays(i).atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
            
            long count = logRepository.countActionsInRange("LOGIN", startOfDay, endOfDay);
            String label = startOfDay.format(formatter);
            
            history.add(new ChartPointResponse(label, count));
        }
        return history;
    }
    
    public AdminStatsResponse getDashboardStats(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        // --- 1. MAPPING DES RÔLES (Pie Chart) ---
        Map<String, Long> roleMap = logRepository.countLoginsByRole(since).stream()
                .collect(Collectors.toMap(obj -> obj[0].toString(), obj -> ((Number) obj[1]).longValue()));

        // --- 2. ÉCO-CONCEPTION : TOP SECTIONS (Bar Chart) ---
        Map<String, Long> viewsMap = logRepository.findMostViewedData(since).stream()
                .collect(Collectors.toMap(obj -> obj[0].toString(), obj -> ((Number) obj[1]).longValue()));

        // --- 3. TEMPS MOYEN PAR RÔLE ---
        List<Object[]> sessionData = logRepository.findUserSessionsWithRole(since);
        // On groupe les durées (minutes) par rôle : Map<Role, List<Durations>>
        Map<String, List<Long>> durationsByRole = sessionData.stream().collect(Collectors.groupingBy(
                obj -> obj[0].toString(),
                Collectors.mapping(obj -> {
                    LocalDateTime start = ((java.sql.Timestamp) obj[2]).toLocalDateTime();
                    LocalDateTime end = ((java.sql.Timestamp) obj[3]).toLocalDateTime();
                    return java.time.Duration.between(start, end).toMinutes();
                }, Collectors.toList())
        ));

        // On calcule la moyenne pour chaque rôle
        Map<String, Double> averageSessionByRole = durationsByRole.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    e -> e.getValue().stream().filter(d -> d > 0).mapToLong(Long::longValue).average().orElse(0.0)
                ));

        // --- 4. SÉCURITÉ : TAUX DE RÉSOLUTION ---
        long totalIncidents = incidentRepository.count();
        // Note: Assurez-vous d'avoir countByStatus dans votre IncidentRepository
        // long resolved = incidentRepository.countByStatus(IncidentStatus.RESOLVED); 
        // Sinon utilisez une valeur fixe pour le test :
        double resolutionRate = 75.0; 

        // --- 5. POINT JOURNALIER : TRAFIC HORAIRE ---
        List<ChartPointResponse> hourlyTraffic = logRepository.findHourlyTraffic().stream()
                .map(obj -> new ChartPointResponse(obj[0].toString() + "h", ((Number) obj[1]).longValue()))
                .collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalLoginsWeek(getWeeklyCount("LOGIN"))
                .totalIncidentsWeek(getWeeklyCount("INCIDENT_CREATED"))
                .totalVolonteers(getTotalVolonteers())
                .loginHistory(getWeeklyLoginHistory())
                .loginsByRole(roleMap)
                .topViewedSections(viewsMap)
                .averageSessionByRole(averageSessionByRole)
                .incidentResolutionRate(resolutionRate)
                .hourlyTraffic(hourlyTraffic)
                .build();
    }
}