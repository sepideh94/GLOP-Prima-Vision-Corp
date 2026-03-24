package com.ciblorgasport.notification.application;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.spectator.domain.Spectator;

@ExtendWith(MockitoExtension.class)
class IncidentNotificationServiceImplTest {

    @Mock
    private AthleteIncidentRecipientResolver athleteIncidentRecipientResolver;

    @Mock
    private CommissionnerIncidentRecipientResolver commissionnerIncidentRecipientResolver;

    @Mock
    private VolonteerIncidentRecipientResolver volonteerIncidentRecipientResolver;

    @Mock
    private SpectatorIncidentRecipientResolver spectatorIncidentRecipientResolver;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private IncidentNotificationServiceImpl incidentNotificationService;

    @BeforeEach
    void setUp() throws Exception {
        Field field = IncidentNotificationServiceImpl.class.getDeclaredField("appBaseUrl");
        field.setAccessible(true);
        field.set(incidentNotificationService, "http://localhost:3000");
    }

    @Test
    void shouldCreateNotificationAndSendEmailForAthleteWhenIncidentCreated() {
        Athlete athlete = Athlete.builder()
                .id(10L)
                .firstName("Sepideh")
                .lastName("Soleimani")
                .email("sepideh@test.com")
                .build();

        NotificationRecipient recipient = new NotificationRecipient(
                athlete,
                "sepideh@test.com",
                "Sepideh Soleimani"
        );

        Incident incident = Incident.builder()
                .id(1L)
                .title("Pluie forte")
                .description("Compétition perturbée")
                .status(IncidentStatus.EN_COURS)
                .impactLevels(Set.of(ImpactLevel.ATHLETE))
                .build();

        when(athleteIncidentRecipientResolver.resolve(incident)).thenReturn(List.of(recipient));

        incidentNotificationService.notifyIncidentCreated(incident);

        verify(notificationService, times(1)).createNotification(
                eq(athlete),
                eq(incident),
                eq(NotificationType.INCIDENT),
                eq("[Incident] Pluie forte"),
                eq("Un nouvel incident a été déclaré. Titre : Pluie forte | Description : Compétition perturbée"),
                eq("http://localhost:3000"),
                eq("EN_COURS")
        );

        verify(emailService, times(1)).sendIncidentNotificationEmail(
                eq("sepideh@test.com"),
                eq("Sepideh Soleimani"),
                eq("[Incident] Pluie forte"),
                eq("Un nouvel incident a été déclaré. Titre : Pluie forte | Description : Compétition perturbée"),
                eq("http://localhost:3000")
        );

        verify(commissionnerIncidentRecipientResolver, never()).resolve();
        verify(volonteerIncidentRecipientResolver, never()).resolve(any());
        verify(spectatorIncidentRecipientResolver, never()).resolve();
    }

    @Test
    void shouldUpdatePreviousStatusesAndSendResolvedNotificationWhenIncidentResolved() {
        Athlete athlete = Athlete.builder()
                .id(11L)
                .firstName("Athlet")
                .lastName("Athletian")
                .email("athlete@test.com")
                .build();

        NotificationRecipient recipient = new NotificationRecipient(
                athlete,
                "athlete@test.com",
                "Athlet Athletian"
        );

        Incident incident = Incident.builder()
                .id(2L)
                .title("Test2")
                .description("Incident résolu maintenant")
                .status(IncidentStatus.RESOLU)
                .impactLevels(Set.of(ImpactLevel.ATHLETE))
                .build();

        when(athleteIncidentRecipientResolver.resolve(incident)).thenReturn(List.of(recipient));

        incidentNotificationService.notifyIncidentResolved(incident);

        verify(notificationService, times(1))
                .updateIncidentNotificationsStatus(eq(incident), eq("RESOLU"));

        verify(notificationService, times(1)).createNotification(
                eq(athlete),
                eq(incident),
                eq(NotificationType.INCIDENT),
                eq("[Incident résolu] Test2"),
                eq("Un incident a été résolu. Titre : Test2 | Description : Incident résolu maintenant"),
                eq("http://localhost:3000"),
                eq("RESOLU")
        );

        verify(emailService, times(1)).sendIncidentNotificationEmail(
                eq("athlete@test.com"),
                eq("Athlet Athletian"),
                eq("[Incident résolu] Test2"),
                eq("Un incident a été résolu. Titre : Test2 | Description : Incident résolu maintenant"),
                eq("http://localhost:3000")
        );

        verify(commissionnerIncidentRecipientResolver, never()).resolve();
        verify(volonteerIncidentRecipientResolver, never()).resolve(any());
        verify(spectatorIncidentRecipientResolver, never()).resolve();
    }

    @Test
    void shouldCreateNotificationAndSendEmailForSpectatorWhenIncidentCreated() {
        Spectator spectator = Spectator.builder()
                .id(20L)
                .firstName("Sara")
                .lastName("Viewer")
                .email("sara@test.com")
                .build();

        NotificationRecipient recipient = new NotificationRecipient(
                spectator,
                "sara@test.com",
                "Sara Viewer"
        );

        Incident incident = Incident.builder()
                .id(3L)
                .title("Spectator only")
                .description("Info")
                .status(IncidentStatus.EN_COURS)
                .impactLevels(Set.of(ImpactLevel.SPECTATOR))
                .build();

        when(spectatorIncidentRecipientResolver.resolve()).thenReturn(List.of(recipient));

        incidentNotificationService.notifyIncidentCreated(incident);

        verify(spectatorIncidentRecipientResolver, times(1)).resolve();
        verify(athleteIncidentRecipientResolver, never()).resolve(any());
        verify(commissionnerIncidentRecipientResolver, never()).resolve();
        verify(volonteerIncidentRecipientResolver, never()).resolve(any());

        verify(notificationService, times(1)).createNotification(
                eq(spectator),
                eq(incident),
                eq(NotificationType.INCIDENT),
                eq("[Incident] Spectator only"),
                eq("Un nouvel incident a été déclaré. Titre : Spectator only | Description : Info"),
                eq("http://localhost:3000"),
                eq("EN_COURS")
        );

        verify(emailService, times(1)).sendIncidentNotificationEmail(
                eq("sara@test.com"),
                eq("Sara Viewer"),
                eq("[Incident] Spectator only"),
                eq("Un nouvel incident a été déclaré. Titre : Spectator only | Description : Info"),
                eq("http://localhost:3000")
        );
    }

    @Test
    void shouldDoNothingWhenImpactLevelsIsEmpty() {
        Incident incident = Incident.builder()
                .id(4L)
                .title("No recipients")
                .description("Info")
                .status(IncidentStatus.EN_COURS)
                .impactLevels(Set.of())
                .build();

        incidentNotificationService.notifyIncidentCreated(incident);

        verify(athleteIncidentRecipientResolver, never()).resolve(any());
        verify(commissionnerIncidentRecipientResolver, never()).resolve();
        verify(volonteerIncidentRecipientResolver, never()).resolve(any());
        verify(spectatorIncidentRecipientResolver, never()).resolve();
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any(), any(), any());
        verify(emailService, never()).sendIncidentNotificationEmail(any(), any(), any(), any(), any());
    }
}