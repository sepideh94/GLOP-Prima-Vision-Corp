package com.ciblorgasport.team.application;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

import java.util.List;
import java.util.Optional;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TeamValidationServiceIntegrationTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private ParticipationRepository participationRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TeamValidationService teamValidationService;

    private Athlete athlete1;
    private Athlete athlete2;
    private Team team;
    private Participation teamParticipation;

    @BeforeEach
    void setUp() {
        athlete1 = mock(Athlete.class);
        athlete2 = mock(Athlete.class);

        when(athlete1.getId()).thenReturn(10L);
        when(athlete2.getId()).thenReturn(11L);

        team = Team.builder()
                .id(5L)
                .name("Team Alpha")
                .members(List.of(athlete1, athlete2))
                .build();

        teamParticipation = Participation.builder()
                .competition(null)
                .competitorId(5L)
                .competitorType(CompetitorType.TEAM)
                .status(ParticipationStatus.INVITED)
                .charterAccepted(false)
                .build();
    }

    @Test
    @DisplayName("validateTeamStatus should confirm team when all members are confirmed")
    void shouldConfirmTeamWhenAllMembersAreConfirmed() {
        Long athleteId = 10L;
        Long competitionId = 100L;

        when(athlete1.getEmail()).thenReturn("a1@test.com");
        when(athlete1.getFirstName()).thenReturn("A1");
        when(athlete2.getEmail()).thenReturn("a2@test.com");
        when(athlete2.getFirstName()).thenReturn("A2");

        when(teamRepository.findAllByMemberId(athleteId)).thenReturn(List.of(team));
        when(participationRepository.findByCompetition_IdAndCompetitorIdAndCompetitorType(
                competitionId, 5L, CompetitorType.TEAM))
                .thenReturn(Optional.of(teamParticipation));

        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                competitionId, 10L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED))
                .thenReturn(true);

        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                competitionId, 11L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED))
                .thenReturn(true);

        teamValidationService.validateTeamStatus(athleteId, competitionId);

        verify(participationRepository).save(teamParticipation);
        verify(emailService).sendTeamParticipationValidatedEmail(
                athlete1.getEmail(), athlete1.getFirstName(), team.getName());
        verify(emailService).sendTeamParticipationValidatedEmail(
                athlete2.getEmail(), athlete2.getFirstName(), team.getName());
    }

    @Test
    @DisplayName("validateTeamStatus should not confirm team when one member is not confirmed")
    void shouldNotConfirmTeamWhenOneMemberIsNotConfirmed() {
        Long athleteId = 10L;
        Long competitionId = 100L;

        when(teamRepository.findAllByMemberId(athleteId)).thenReturn(List.of(team));
        when(participationRepository.findByCompetition_IdAndCompetitorIdAndCompetitorType(
                competitionId, 5L, CompetitorType.TEAM))
                .thenReturn(Optional.of(teamParticipation));

        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                competitionId, 10L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED))
                .thenReturn(true);

        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                competitionId, 11L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED))
                .thenReturn(false);

        teamValidationService.validateTeamStatus(athleteId, competitionId);

        verify(participationRepository, never()).save(teamParticipation);
        verify(emailService, never()).sendTeamParticipationValidatedEmail(any(), any(), any());
    }
}