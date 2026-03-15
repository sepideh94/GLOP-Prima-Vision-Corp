package com.ciblorgasport.analytics.application;

import com.ciblorgasport.analytics.domain.SystemLog;
import com.ciblorgasport.analytics.infrastructure.SystemLogRepository;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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
}