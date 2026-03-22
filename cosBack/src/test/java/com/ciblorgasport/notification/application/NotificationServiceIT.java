package com.ciblorgasport.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.notification.domain.Notification;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.infrastructure.NotificationRepository;

@SpringBootTest
@Transactional
class NotificationServiceIT {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    private Athlete savedAthlete;

    @BeforeEach
    void setUp() {
        Athlete athlete = new Athlete();
        athlete.setFirstName("Test");
        athlete.setLastName("User");
        athlete.setEmail("test.user@notif.com");
        athlete.setPassword("password");
        athlete.setActive(true);
        savedAthlete = athleteRepository.save(athlete);
    }

    @Test
    void shouldCreateNotificationSuccessfully() {
        Notification created = notificationService.createNotification(
                savedAthlete,
                null,
                NotificationType.INCIDENT,
                "Alerte Incident",
                "Un problème a été détecté",
                "/incidents/1",
                "OPEN"
        );

        assertThat(created.getId()).isNotNull();
        assertThat(created.getRecipient().getId()).isEqualTo(savedAthlete.getId());
        assertThat(created.getIsRead()).isFalse();
        assertThat(created.getType()).isEqualTo(NotificationType.INCIDENT);
    }

    @Test
    void shouldMarkAsRead() {
        Notification n = notificationService.createNotification(
                savedAthlete, null, NotificationType.INCIDENT, "Title", "Msg", null, null);
        
        notificationService.markAsRead(n.getId(), savedAthlete);

        Notification updated = notificationRepository.findById(n.getId()).orElseThrow();
        assertThat(updated.getIsRead()).isTrue();
    }

    @Test
    void shouldThrowExceptionWhenMarkingOtherUsersNotification() {
        Notification n = notificationService.createNotification(
                savedAthlete, null, NotificationType.INCIDENT, "Title", "Msg", null, null);
        
        Athlete otherAthlete = new Athlete();
        otherAthlete.setFirstName("Other");
        otherAthlete.setLastName("User");
        otherAthlete.setEmail("other@notif.com");
        otherAthlete.setPassword("pass");
        athleteRepository.save(otherAthlete);

        assertThrows(ResponseStatusException.class, () -> {
            notificationService.markAsRead(n.getId(), otherAthlete);
        });
    }

    @Test
    void shouldCountUnreadNotificationsCorrectly() {
        notificationService.createNotification(savedAthlete, null, NotificationType.INCIDENT, "T1", "M1", null, null);
        Notification n2 = notificationService.createNotification(savedAthlete, null, NotificationType.INCIDENT, "T2", "M2", null, null);
        
        notificationService.markAsRead(n2.getId(), savedAthlete);

        long count = notificationRepository.countByRecipient_IdAndIsReadFalse(savedAthlete.getId());
        assertThat(count).isEqualTo(1);
    }

    @Test
    void shouldDeleteNotificationsByIncidentId() {
        notificationService.deleteByIncidentId(999L);
    }
}