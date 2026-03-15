package com.ciblorgasport.notification.application;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationRecipient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentNotificationServiceImpl implements IncidentNotificationService {

    private final AthleteIncidentRecipientResolver athleteIncidentRecipientResolver;
    private final CommissionnerIncidentRecipientResolver commissionnerIncidentRecipientResolver;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Override
    public void notifyIncidentCreated(Incident incident) {
        String incidentTitle = safeIncidentTitle(incident);
        String incidentDescription = safeIncidentDescription(incident);

        String title = "[Incident] " + incidentTitle;
        String message = "Un nouvel incident a été déclaré. Titre : " + incidentTitle + " | Description : " + incidentDescription;

        notifyRecipients(incident, title, message);
    }

    @Override
    public void notifyIncidentUpdated(Incident incident) {
        String incidentTitle = safeIncidentTitle(incident);
        String incidentDescription = safeIncidentDescription(incident);

        String title = "[Incident mis à jour] " + incidentTitle;
        String message = "Un incident a été mis à jour. Titre : " + incidentTitle + " | Description : " + incidentDescription;

        notifyRecipients(incident, title, message);
    }

    @Override
    public void notifyIncidentResolved(Incident incident) {
        String incidentTitle = safeIncidentTitle(incident);
        String incidentDescription = safeIncidentDescription(incident);

        String title = "[Incident résolu] " + incidentTitle;
        String message = "Un incident a été résolu. Titre : " + incidentTitle + " | Description : " + incidentDescription;

        notificationService.updateIncidentNotificationsStatus(
                incident,
                IncidentStatus.RESOLU.name()
        );

        notifyRecipients(incident, title, message);
    }

    private void notifyRecipients(Incident incident, String title, String message) {
        if (incident == null || incident.getImpactLevels() == null || incident.getImpactLevels().isEmpty()) {
            return;
        }

        String link = buildIncidentLink(incident);

        if (incident.getImpactLevels().contains(ImpactLevel.ATHLETE)
                || incident.getImpactLevels().contains(ImpactLevel.TOUS)) {
            List<NotificationRecipient> athleteRecipients = athleteIncidentRecipientResolver.resolve(incident);
            sendToRecipients(incident, athleteRecipients, title, message, link);
        }

        if (incident.getImpactLevels().contains(ImpactLevel.COMMISSIONNER)
                || incident.getImpactLevels().contains(ImpactLevel.TOUS)) {
            List<NotificationRecipient> commissionnerRecipients = commissionnerIncidentRecipientResolver.resolve();
            sendToRecipients(incident, commissionnerRecipients, title, message, link);
        }
    }

    private void sendToRecipients(Incident incident, List<NotificationRecipient> recipients, String title, String message, String link) {
        if (recipients == null || recipients.isEmpty()) {
            return;
        }

        for (NotificationRecipient recipient : recipients) {
            notificationService.createNotification(
                    recipient.user(),
                    incident,
                    NotificationType.INCIDENT,
                    title,
                    message,
                    link,
                    incident.getStatus() == null ? null : incident.getStatus().name()
            );

            emailService.sendIncidentNotificationEmail(
                    recipient.email(),
                    recipient.displayName(),
                    title,
                    message,
                    link
            );
        }
    }

    private String buildIncidentLink(Incident incident) {
        return appBaseUrl;
    }

    private String safeIncidentTitle(Incident incident) {
        if (incident == null || incident.getTitle() == null || incident.getTitle().isBlank()) {
            return "Sans titre";
        }
        return incident.getTitle();
    }

    private String safeIncidentDescription(Incident incident) {
        if (incident == null || incident.getDescription() == null || incident.getDescription().isBlank()) {
            return "Aucune description";
        }
        return incident.getDescription();
    }
}