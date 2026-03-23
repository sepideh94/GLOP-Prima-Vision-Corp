package com.ciblorgasport.trial.application;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.commissionner.CommissionerRepository;
import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialModeStrategy;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.TrialParticipantStatus;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.trial.round.domain.RoundName;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TrialParticipantServiceImplTest {

    @Mock
    private TrialRepository trialRepository;

    @Mock
    private TrialParticipantRepository trialParticipantRepository;

    @Mock
    private AthleteRepository athleteRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private ParticipationRepository participationRepository;

    @Mock
    private CommissionerRepository commissionerRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private TrialModeStrategy strategy;

    @InjectMocks
    private TrialParticipantServiceImpl trialParticipantService;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private Trial trial;

    private Athlete mockEligibleAthlete(Long id, String firstName, String lastName) {
        Athlete athlete = org.mockito.Mockito.mock(Athlete.class);
        when(athlete.getId()).thenReturn(id);
        when(athlete.getFirstName()).thenReturn(firstName);
        when(athlete.getLastName()).thenReturn(lastName);
        when(athlete.getDisplayName()).thenReturn(firstName + " " + lastName);
        when(athlete.isActive()).thenReturn(true);
        when(athlete.isProfileComplete()).thenReturn(true);
        return athlete;
    }

    private Team mockEligibleTeam(Long id, String name, List<Athlete> members) {
        Team team = org.mockito.Mockito.mock(Team.class);
        when(team.getId()).thenReturn(id);
        when(team.getName()).thenReturn(name);
        when(team.getMembers()).thenReturn(members);
        return team;
    }

    private Commissionner mockCommissioner(Long id, String firstName, String email) {
        Commissionner commissioner = org.mockito.Mockito.mock(Commissionner.class);
        when(commissioner.getId()).thenReturn(id);
        when(commissioner.getFirstName()).thenReturn(firstName);
        when(commissioner.getEmail()).thenReturn(email);
        return commissioner;
    }

    private void stubQualificationTrial() {
        when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
        when(trial.hasStarted()).thenReturn(false);
        when(trial.isCancelled()).thenReturn(false);
        when(trial.getRound().getName()).thenReturn(RoundName.QUALIFICATION_HEAT);
        when(trial.getModeStrategy()).thenReturn(strategy);
        when(trial.getCompetition().getId()).thenReturn(100L);

        when(strategy.getMaxParticipantsPerHeat()).thenReturn(10);
        when(strategy.getParticipantTypeLabel()).thenReturn("participant");
    }

    @Nested
    class AssignAthletesTests {

        @Test
        void shouldAssignAthletesSuccessfully() {
            Athlete athlete1 = mockEligibleAthlete(13L, "Ali", "Reza");
            Athlete athlete2 = mockEligibleAthlete(14L, "Sara", "Noor");

            stubQualificationTrial();

            when(trialParticipantRepository.countByTrialId(1L)).thenReturn(0L);

            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete1));
            when(athleteRepository.findById(14L)).thenReturn(Optional.of(athlete2));

            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 13L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)).thenReturn(true);
            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 14L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)).thenReturn(true);

            when(trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    1L, 13L, CompetitorType.ATHLETE)).thenReturn(false);
            when(trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    1L, 14L, CompetitorType.ATHLETE)).thenReturn(false);

            when(trialParticipantRepository.saveAll(anyList()))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            List<TrialParticipantResponse> result =
                    trialParticipantService.assignAthletes(1L, List.of(13L, 14L));

            assertEquals(2, result.size());
            assertEquals("Ali Reza", result.get(0).getDisplayName());
            assertEquals("Sara Noor", result.get(1).getDisplayName());
            assertEquals(CompetitorType.ATHLETE, result.get(0).getCompetitorType());

            verify(trialParticipantRepository).saveAll(anyList());
        }

        @Test
        void shouldIgnoreDuplicateAthleteIds() {
            Athlete athlete1 = mockEligibleAthlete(13L, "Ali", "Reza");

            stubQualificationTrial();

            when(trialParticipantRepository.countByTrialId(1L)).thenReturn(0L);
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete1));

            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 13L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)).thenReturn(true);

            when(trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    1L, 13L, CompetitorType.ATHLETE)).thenReturn(false);

            when(trialParticipantRepository.saveAll(anyList()))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            List<TrialParticipantResponse> result =
                    trialParticipantService.assignAthletes(1L, List.of(13L, 13L));

            assertEquals(1, result.size());
            assertEquals("Ali Reza", result.get(0).getDisplayName());
        }

        @Test
        void shouldThrowWhenAthleteAlreadyAssigned() {
            Athlete athlete1 = mockEligibleAthlete(13L, "Ali", "Reza");

            stubQualificationTrial();

            when(trialParticipantRepository.countByTrialId(1L)).thenReturn(0L);
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete1));

            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 13L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)).thenReturn(true);

            when(trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    1L, 13L, CompetitorType.ATHLETE)).thenReturn(true);

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> trialParticipantService.assignAthletes(1L, List.of(13L))
            );

            assertEquals("L'athlète Ali Reza est déjà assigné à cette épreuve.", exception.getMessage());
        }

        @Test
        void shouldThrowWhenAthleteNotConfirmed() {
            Athlete athlete1 = mockEligibleAthlete(13L, "Ali", "Reza");

            stubQualificationTrial();

            when(trialParticipantRepository.countByTrialId(1L)).thenReturn(0L);
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete1));

            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 13L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)).thenReturn(false);

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> trialParticipantService.assignAthletes(1L, List.of(13L))
            );

            assertEquals("L'athlète Ali Reza n'a pas de participation CONFIRMED à la compétition.", exception.getMessage());
        }
    }

    @Nested
    class AssignTeamsTests {

        @Test
        void shouldAssignTeamsSuccessfully() {
            Athlete athlete1 = mockEligibleAthlete(13L, "Ali", "Reza");
            Athlete athlete2 = mockEligibleAthlete(14L, "Sara", "Noor");
            Team team1 = mockEligibleTeam(21L, "Team Alpha", List.of(athlete1, athlete2));
            Team team2 = mockEligibleTeam(22L, "Team Beta", List.of(athlete1));

            stubQualificationTrial();

            when(trialParticipantRepository.countByTrialId(1L)).thenReturn(0L);

            when(teamRepository.findById(21L)).thenReturn(Optional.of(team1));
            when(teamRepository.findById(22L)).thenReturn(Optional.of(team2));

            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 21L, CompetitorType.TEAM, ParticipationStatus.CONFIRMED)).thenReturn(true);
            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 22L, CompetitorType.TEAM, ParticipationStatus.CONFIRMED)).thenReturn(true);

            when(trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    1L, 21L, CompetitorType.TEAM)).thenReturn(false);
            when(trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    1L, 22L, CompetitorType.TEAM)).thenReturn(false);

            when(trialParticipantRepository.saveAll(anyList()))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            List<TrialParticipantResponse> result =
                    trialParticipantService.assignTeams(1L, List.of(21L, 22L));

            assertEquals(2, result.size());
            assertEquals("Team Alpha", result.get(0).getDisplayName());
            assertEquals("Team Beta", result.get(1).getDisplayName());
            assertEquals(CompetitorType.TEAM, result.get(0).getCompetitorType());
            assertNotNull(result.get(0).getMembers());
            assertEquals(2, result.get(0).getMembers().size());

            verify(trialParticipantRepository).saveAll(anyList());
        }

        @Test
        void shouldThrowWhenTeamAlreadyAssigned() {
            Athlete athlete1 = mockEligibleAthlete(13L, "Ali", "Reza");
            Athlete athlete2 = mockEligibleAthlete(14L, "Sara", "Noor");
            Team team1 = mockEligibleTeam(21L, "Team Alpha", List.of(athlete1, athlete2));

            stubQualificationTrial();

            when(trialParticipantRepository.countByTrialId(1L)).thenReturn(0L);
            when(teamRepository.findById(21L)).thenReturn(Optional.of(team1));

            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 21L, CompetitorType.TEAM, ParticipationStatus.CONFIRMED)).thenReturn(true);

            when(trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    1L, 21L, CompetitorType.TEAM)).thenReturn(true);

            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> trialParticipantService.assignTeams(1L, List.of(21L))
            );

            assertEquals("L'équipe Team Alpha est déjà assignée à cette série.", exception.getMessage());
        }

        @Test
        void shouldThrowWhenTeamNotConfirmed() {
            Athlete athlete1 = mockEligibleAthlete(13L, "Ali", "Reza");
            Athlete athlete2 = mockEligibleAthlete(14L, "Sara", "Noor");
            Team team1 = mockEligibleTeam(21L, "Team Alpha", List.of(athlete1, athlete2));

            stubQualificationTrial();

            when(trialParticipantRepository.countByTrialId(1L)).thenReturn(0L);
            when(teamRepository.findById(21L)).thenReturn(Optional.of(team1));

            when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    100L, 21L, CompetitorType.TEAM, ParticipationStatus.CONFIRMED)).thenReturn(false);

            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> trialParticipantService.assignTeams(1L, List.of(21L))
            );

            assertEquals("L'équipe Team Alpha n'est pas confirmée pour cette compétition.", exception.getMessage());
        }
    }

}