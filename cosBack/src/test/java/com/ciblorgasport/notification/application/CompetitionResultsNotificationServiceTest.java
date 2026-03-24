package com.ciblorgasport.notification.application;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.spectator.domain.Spectator;
import com.ciblorgasport.trial.domain.Trial;

@ExtendWith(MockitoExtension.class)
class CompetitionResultsNotificationServiceTest {

    @Mock
    private CompetitionFollowerRecipientResolver competitionFollowerRecipientResolver;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private CompetitionResultsNotificationService service;

    @BeforeEach
    void setBaseUrl() throws Exception {
        Field f = CompetitionResultsNotificationService.class.getDeclaredField("appBaseUrl");
        f.setAccessible(true);
        f.set(service, "https://app.example");
    }

    @Test
    void skipsWhenTrialHasNoCompetition() {
        Trial trial = new Trial();
        trial.setId(1L);
        trial.setName("100m");
        service.notifyFollowers(trial, false);
        verifyNoInteractions(competitionFollowerRecipientResolver, notificationService, emailService);
    }

    @Test
    void notifiesFollowersWithCompetitionResultsType() throws Exception {
        Competition competition = new Competition();
        competition.setId(9L);
        competition.setName("Coupe");

        Trial trial = new Trial();
        trial.setId(2L);
        trial.setName("Saut");
        trial.setCompetition(competition);

        Spectator spec = Spectator.builder().id(40L).email("x@test.com").firstName("X").lastName("Y").build();
        when(competitionFollowerRecipientResolver.resolveFollowers(9L)).thenReturn(List.of(
                new NotificationRecipient(spec, "x@test.com", "X Y")
        ));

        service.notifyFollowers(trial, false);

        verify(notificationService).createSystemNotification(
                eq(spec),
                eq(NotificationType.COMPETITION_RESULTS),
                eq("[Classement disponible] Saut"),
                eq("Le classement de l'épreuve « Saut » (Coupe) est disponible."),
                eq("https://app.example")
        );
        verify(emailService).sendIncidentNotificationEmail(
                eq("x@test.com"),
                eq("X Y"),
                eq("[Classement disponible] Saut"),
                eq("Le classement de l'épreuve « Saut » (Coupe) est disponible."),
                eq("https://app.example")
        );
    }
}
