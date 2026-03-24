package com.ciblorgasport.notification.application;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.config.FrontendUrlBuilder;
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
    private final VolonteerIncidentRecipientResolver volonteerIncidentRecipientResolver;
    private final SpectatorIncidentRecipientResolver spectatorIncidentRecipientResolver;
    private final CompetitionFollowerRecipientResolver competitionFollowerRecipientResolver;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final FrontendUrlBuilder frontendUrlBuilder;

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
        Set<Long> notifiedUserIds = new HashSet<>();

        Long competitionId = IncidentCompetitionResolver.resolveCompetitionId(incident);
        if (competitionId != null) {
            List<NotificationRecipient> competitionFollowers = competitionFollowerRecipientResolver.resolveFollowers(competitionId);
            sendToRecipients(incident, competitionFollowers, title, message, link, notifiedUserIds);
        }

        if (incident.getImpactLevels().contains(ImpactLevel.ATHLETE)
                || incident.getImpactLevels().contains(ImpactLevel.TOUS)) {
            List<NotificationRecipient> athleteRecipients = athleteIncidentRecipientResolver.resolve(incident);
            sendToRecipients(incident, athleteRecipients, title, message, link, notifiedUserIds);
        }

        if (incident.getImpactLevels().contains(ImpactLevel.COMMISSIONNER)
                || incident.getImpactLevels().contains(ImpactLevel.TOUS)) {
            List<NotificationRecipient> commissionnerRecipients = commissionnerIncidentRecipientResolver.resolve();
            sendToRecipients(incident, commissionnerRecipients, title, message, link, notifiedUserIds);
        }

        if (incident.getImpactLevels().contains(ImpactLevel.VOLONTEER)
                || incident.getImpactLevels().contains(ImpactLevel.TOUS)) {
            List<NotificationRecipient> volonteerRecipients = volonteerIncidentRecipientResolver.resolve(incident);
            sendToRecipients(incident, volonteerRecipients, title, message, link, notifiedUserIds);
        }

        if (incident.getImpactLevels().contains(ImpactLevel.SPECTATOR)
                || incident.getImpactLevels().contains(ImpactLevel.TOUS)) {
            if (competitionId == null) {
                List<NotificationRecipient> spectatorRecipients = spectatorIncidentRecipientResolver.resolve();
                sendToRecipients(incident, spectatorRecipients, title, message, link, notifiedUserIds);
            }
        }
    }

    private void sendToRecipients(
            Incident incident,
            List<NotificationRecipient> recipients,
            String title,
            String message,
            String link,
            Set<Long> notifiedUserIds
    ) {
        if (recipients == null || recipients.isEmpty()) {
            return;
        }

        for (NotificationRecipient recipient : recipients) {
            Long userId = recipient.user() == null ? null : recipient.user().getId();
            if (userId != null && notifiedUserIds.contains(userId)) {
                continue;
            }
            if (userId != null) {
                notifiedUserIds.add(userId);
            }

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
        return frontendUrlBuilder.path("/login?next=/notifications");
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