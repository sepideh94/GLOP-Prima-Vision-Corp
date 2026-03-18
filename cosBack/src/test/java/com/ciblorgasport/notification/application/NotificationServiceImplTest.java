package com.ciblorgasport.notification.application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.notification.domain.Notification;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationResponse;
import com.ciblorgasport.notification.infrastructure.NotificationRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Athlete athlete;
    private Incident incident;

    @BeforeEach
    void setUp() {
        athlete = Athlete.builder()
                .id(10L)
                .firstName("Sepideh")
                .lastName("Soleimani")
                .email("sepideh@test.com")
                .build();

        incident = Incident.builder()
                .id(100L)
                .title("Pluie forte")
                .description("Description incident")
                .build();
    }

    @Test
    void shouldCreateNotification() {
        Notification saved = Notification.builder()
                .id(1L)
                .recipient(athlete)
                .incident(incident)
                .type(NotificationType.INCIDENT)
                .title("[Incident] Pluie forte")
                .message("message")
                .incidentStatus("EN_COURS")
                .link("http://localhost:3000")
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        Notification result = notificationService.createNotification(
                athlete,
                incident,
                NotificationType.INCIDENT,
                "[Incident] Pluie forte",
                "message",
                "http://localhost:3000",
                "EN_COURS"
        );

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification toSave = captor.getValue();
        assertEquals(athlete, toSave.getRecipient());
        assertEquals(incident, toSave.getIncident());
        assertEquals(NotificationType.INCIDENT, toSave.getType());
        assertEquals("[Incident] Pluie forte", toSave.getTitle());
        assertEquals("message", toSave.getMessage());
        assertEquals("EN_COURS", toSave.getIncidentStatus());
        assertEquals("http://localhost:3000", toSave.getLink());
        assertFalse(toSave.getIsRead());

        assertEquals(1L, result.getId());
    }

    @Test
    void shouldThrowWhenRecipientIsNull() {
        assertThrows(ResponseStatusException.class, () ->
                notificationService.createNotification(
                        null,
                        incident,
                        NotificationType.INCIDENT,
                        "title",
                        "message",
                        "link",
                        "EN_COURS"
                )
        );
    }

    @Test
    void shouldReturnMyNotifications() {
        Notification notification = Notification.builder()
                .id(2L)
                .recipient(athlete)
                .incident(incident)
                .type(NotificationType.INCIDENT)
                .title("[Incident] Test")
                .message("message test")
                .incidentStatus("EN_COURS")
                .link("http://localhost:3000")
                .isRead(false)
                .sentAt(LocalDateTime.of(2026, 3, 15, 20, 0))
                .build();

        when(notificationRepository.findByRecipient_IdOrderBySentAtDesc(athlete.getId()))
                .thenReturn(List.of(notification));

        List<NotificationResponse> results = notificationService.getMyNotifications(athlete);

        assertEquals(1, results.size());
        NotificationResponse response = results.get(0);
        assertEquals(2L, response.getId());
        assertEquals(NotificationType.INCIDENT, response.getType());
        assertEquals("[Incident] Test", response.getTitle());
        assertEquals("message test", response.getMessage());
        assertEquals("EN_COURS", response.getIncidentStatus());
        assertEquals("http://localhost:3000", response.getLink());
        assertEquals(false, response.getIsRead());
    }

    @Test
    void shouldCountUnreadNotifications() {
        when(notificationRepository.countByRecipient_IdAndIsReadFalse(athlete.getId()))
                .thenReturn(3L);

        long result = notificationService.countUnread(athlete);

        assertEquals(3L, result);
    }

    @Test
    void shouldMarkAsRead() {
        Notification notification = Notification.builder()
                .id(5L)
                .recipient(athlete)
                .type(NotificationType.INCIDENT)
                .title("title")
                .message("message")
                .isRead(false)
                .build();

        when(notificationRepository.findById(5L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.markAsRead(5L, athlete);

        assertEquals(true, notification.getIsRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void shouldUpdateIncidentNotificationsStatusOnly() {
        Notification n1 = Notification.builder()
                .id(1L)
                .recipient(athlete)
                .incident(incident)
                .type(NotificationType.INCIDENT)
                .title("[Incident] A")
                .message("msg A")
                .incidentStatus("EN_COURS")
                .isRead(false)
                .build();

        Notification n2 = Notification.builder()
                .id(2L)
                .recipient(athlete)
                .incident(incident)
                .type(NotificationType.INCIDENT)
                .title("[Incident mis à jour] A")
                .message("msg B")
                .incidentStatus("EN_COURS")
                .isRead(false)
                .build();

        when(notificationRepository.findByIncident_Id(incident.getId()))
                .thenReturn(List.of(n1, n2));

        notificationService.updateIncidentNotificationsStatus(incident, "RESOLU");

        assertEquals("RESOLU", n1.getIncidentStatus());
        assertEquals("RESOLU", n2.getIncidentStatus());

        assertEquals("[Incident] A", n1.getTitle());
        assertEquals("msg A", n1.getMessage());
        assertEquals("[Incident mis à jour] A", n2.getTitle());
        assertEquals("msg B", n2.getMessage());

        verify(notificationRepository).saveAll(List.of(n1, n2));
    }
}