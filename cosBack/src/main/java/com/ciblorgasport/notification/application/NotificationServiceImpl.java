package com.ciblorgasport.notification.application;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.notification.domain.Notification;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationResponse;
import com.ciblorgasport.notification.infrastructure.NotificationRepository;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(
            UserAccount recipient,
            Incident incident,
            NotificationType type,
            String title,
            String message,
            String link,
            String incidentStatus
    ) {
        if (recipient == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destinataire notification manquant.");
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .incident(incident)
                .type(type)
                .title(title)
                .message(message)
                .incidentStatus(incidentStatus)
                .link(link)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    public Notification createSystemNotification(
            UserAccount recipient,
            NotificationType type,
            String title,
            String message,
            String link
    ) {
        if (recipient == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destinataire notification manquant.");
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .incident(null)
                .type(type)
                .title(title)
                .message(message)
                .incidentStatus(null)
                .link(link)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    public void markAsRead(Long notificationId, UserAccount actor) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable."));

        if (actor == null || (!actor.isAdmin() && !notification.getRecipient().getId().equals(actor.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(UserAccount actor) {
        if (actor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }

        return notificationRepository.findByRecipient_IdOrderBySentAtDesc(actor.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(UserAccount actor) {
        if (actor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }

        return notificationRepository.countByRecipient_IdAndIsReadFalse(actor.getId());
    }

    @Override
    public void updateIncidentNotificationsStatus(Incident incident, String incidentStatus) {
        if (incident == null || incident.getId() == null) {
            return;
        }

        List<Notification> notifications = notificationRepository.findByIncident_Id(incident.getId());
        for (Notification notification : notifications) {
            notification.setIncidentStatus(incidentStatus);
        }

        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .incidentStatus(notification.getIncidentStatus())
                .link(notification.getLink())
                .isRead(notification.getIsRead())
                .sentAt(notification.getSentAt())
                .build();
    }
}