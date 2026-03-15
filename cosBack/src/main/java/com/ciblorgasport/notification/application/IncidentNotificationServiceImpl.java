package com.ciblorgasport.notification.application;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationRecipient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentNotificationServiceImpl implements IncidentNotificationService {

    private final AthleteIncidentRecipientResolver athleteIncidentRecipientResolver;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Override
    public void notifyIncidentCreated(Incident incident) {
        if (incident == null || incident.getImpactLevels() == null || incident.getImpactLevels().isEmpty()) {
            return;
        }

        if (!incident.getImpactLevels().contains(ImpactLevel.ATHLETE)
                && !incident.getImpactLevels().contains(ImpactLevel.TOUS)) {
            return;
        }

        List<NotificationRecipient> recipients = athleteIncidentRecipientResolver.resolve(incident);
        if (recipients.isEmpty()) {
            return;
        }

        String title = incident.getTitle() != null && !incident.getTitle().isBlank()
        ? incident.getTitle()
        : "Nouvel incident";

            String message = incident.getDescription() != null && !incident.getDescription().isBlank()
        ? incident.getDescription()
        : "Vous avez une nouvelle notification liée à un incident.";

            String link = buildIncidentLink(incident);

        for (NotificationRecipient recipient : recipients) {
            notificationService.createNotification(
                    recipient.user(),
                    NotificationType.INCIDENT,
                    title,
                    message,
                    link
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
}