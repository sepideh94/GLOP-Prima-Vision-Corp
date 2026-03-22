package com.ciblorgasport.notification.application;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.trial.domain.Trial;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CompetitionResultsNotificationService {

    private final CompetitionFollowerRecipientResolver competitionFollowerRecipientResolver;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    /**
     * Notifie les spectateurs abonnés à la compétition lorsqu'un classement est publié ou mis à jour.
     */
    public void notifyFollowers(Trial trial, boolean updated) {
        if (trial == null || trial.getCompetition() == null || trial.getCompetition().getId() == null) {
            return;
        }
        Long competitionId = trial.getCompetition().getId();
        String trialName = trial.getName() == null || trial.getName().isBlank() ? "Épreuve" : trial.getName();
        String compName = trial.getCompetition().getName() == null || trial.getCompetition().getName().isBlank()
                ? "Compétition"
                : trial.getCompetition().getName();

        String title = updated ? "[Résultats mis à jour] " + trialName : "[Classement disponible] " + trialName;
        String message = updated
                ? "Le classement de l'épreuve « " + trialName + " » (" + compName + ") a été mis à jour."
                : "Le classement de l'épreuve « " + trialName + " » (" + compName + ") est disponible.";

        String link = appBaseUrl;

        List<NotificationRecipient> recipients = competitionFollowerRecipientResolver.resolveFollowers(competitionId);
        for (NotificationRecipient recipient : recipients) {
            notificationService.createSystemNotification(
                    recipient.user(),
                    NotificationType.COMPETITION_RESULTS,
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
}
