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
import com.ciblorgasport.common.exception.BusinessValidationException;
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

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
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

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
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

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
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

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
                    () -> trialParticipantService.assignTeams(1L, List.of(21L))
            );

            assertEquals("L'équipe Team Alpha n'est pas confirmée pour cette compétition.", exception.getMessage());
        }
    }

    @Nested
    class DeclareForfeitServiceTests {

        @Test
        void shouldDeclareForfeitSuccessfully() {
            TrialParticipant participant = TrialParticipant.builder()
                    .id(4L)
                    .trial(trial)
                    .competitorId(13L)
                    .competitorType(CompetitorType.ATHLETE)
                    .status(TrialParticipantStatus.ACTIVE)
                    .build();

            when(trial.hasStarted()).thenReturn(false);
            when(trialParticipantRepository.findAccessibleByIdForAthlete(4L, 13L))
                    .thenReturn(Optional.of(participant));
            Athlete athlete = mockEligibleAthlete(13L, "Ali", "Reza");
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete));

            assertDoesNotThrow(() -> trialParticipantService.declareForfeit(4L, 13L));

            assertEquals(TrialParticipantStatus.FORFEIT, participant.getStatus());
            verify(trialParticipantRepository).save(participant);
        }

        @Test
        void shouldThrowWhenTrialParticipantNotFound() {
            when(trialParticipantRepository.findAccessibleByIdForAthlete(4L, 13L))
                    .thenReturn(Optional.empty());

            EntityNotFoundException exception = assertThrows(
                    EntityNotFoundException.class,
                    () -> trialParticipantService.declareForfeit(4L, 13L)
            );

            assertEquals("Participation à l'épreuve introuvable", exception.getMessage());
        }

        @Test
        void shouldThrowWhenTrialAlreadyStarted() {
            TrialParticipant participant = TrialParticipant.builder()
                    .id(4L)
                    .trial(trial)
                    .competitorId(13L)
                    .competitorType(CompetitorType.ATHLETE)
                    .status(TrialParticipantStatus.ACTIVE)
                    .build();

            when(trial.hasStarted()).thenReturn(true);
            when(trialParticipantRepository.findAccessibleByIdForAthlete(4L, 13L))
                    .thenReturn(Optional.of(participant));
            Athlete athlete = mockEligibleAthlete(13L, "Ali", "Reza");
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete));

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
                    () -> trialParticipantService.declareForfeit(4L, 13L)
            );

            assertEquals("L'épreuve a déjà commencé.", exception.getMessage());
        }

        @Test
        void shouldThrowWhenForfeitAlreadyDeclared() {
            TrialParticipant participant = TrialParticipant.builder()
                    .id(4L)
                    .trial(trial)
                    .competitorId(13L)
                    .competitorType(CompetitorType.ATHLETE)
                    .status(TrialParticipantStatus.FORFEIT)
                    .build();

            when(trial.hasStarted()).thenReturn(false);
            when(trialParticipantRepository.findAccessibleByIdForAthlete(4L, 13L))
                    .thenReturn(Optional.of(participant));
            Athlete athlete = mockEligibleAthlete(13L, "Ali", "Reza");
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete));

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
                    () -> trialParticipantService.declareForfeit(4L, 13L)
            );

            assertEquals("Le forfait a déjà été déclaré pour cette épreuve.", exception.getMessage());
        }
    }

    @Nested
    class TrialParticipantEntityTests {

        @Test
        void shouldDeclareForfeitOnEntity() {
            TrialParticipant participant = TrialParticipant.builder()
                    .id(5L)
                    .trial(trial)
                    .competitorId(13L)
                    .competitorType(CompetitorType.ATHLETE)
                    .status(TrialParticipantStatus.ACTIVE)
                    .build();

            when(trial.hasStarted()).thenReturn(false);

            assertDoesNotThrow(participant::declareForfeit);

            assertEquals(TrialParticipantStatus.FORFEIT, participant.getStatus());
            assertNotNull(participant.getUpdatedAt());
        }

        @Test
        void shouldThrowWhenDeclaringForfeitOnStartedTrial() {
            TrialParticipant participant = TrialParticipant.builder()
                    .id(5L)
                    .trial(trial)
                    .competitorId(13L)
                    .competitorType(CompetitorType.ATHLETE)
                    .status(TrialParticipantStatus.ACTIVE)
                    .build();

            when(trial.hasStarted()).thenReturn(true);

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
                    participant::declareForfeit
            );

            assertEquals("L'épreuve a déjà commencé.", exception.getMessage());
        }

        @Test
        void shouldThrowWhenForfeitAlreadyDeclaredOnEntity() {
            TrialParticipant participant = TrialParticipant.builder()
                    .id(5L)
                    .trial(trial)
                    .competitorId(13L)
                    .competitorType(CompetitorType.ATHLETE)
                    .status(TrialParticipantStatus.FORFEIT)
                    .build();

            when(trial.hasStarted()).thenReturn(false);

            BusinessValidationException exception = assertThrows(
                    BusinessValidationException.class,
                    participant::declareForfeit
            );

            assertEquals("Le forfait a déjà été déclaré pour cette épreuve.", exception.getMessage());
        }
    }

    @Nested
    class GetMethodsTests {

        @Test
        void shouldGetByTrialId() {
            when(trialRepository.existsById(1L)).thenReturn(true);
            TrialParticipant tpAthlete = TrialParticipant.builder()
                    .id(10L).trial(trial).competitorId(13L).competitorType(CompetitorType.ATHLETE).build();
            TrialParticipant tpTeam = TrialParticipant.builder()
                    .id(11L).trial(trial).competitorId(21L).competitorType(CompetitorType.TEAM).build();

            when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of(tpAthlete, tpTeam));

            Athlete athlete = mockEligibleAthlete(13L, "Ali", "Reza");
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete));

            Team team = mockEligibleTeam(21L, "Team Alpha", List.of(athlete));
            when(teamRepository.findById(21L)).thenReturn(Optional.of(team));

            List<TrialParticipantResponse> results = trialParticipantService.getByTrialId(1L);

            assertEquals(2, results.size());
            assertEquals("Ali Reza", results.get(0).getDisplayName());
            assertEquals("Team Alpha", results.get(1).getDisplayName());
        }

        @Test
        void shouldThrowWhenGetByTrialIdNotFound() {
            when(trialRepository.existsById(1L)).thenReturn(false);
            RuntimeException exception = assertThrows(RuntimeException.class, () -> trialParticipantService.getByTrialId(1L));
            assertEquals("Épreuve introuvable avec l'ID: 1", exception.getMessage());
        }

        @Test
        void shouldGetByAthleteId() {
            TrialParticipant tpAthlete = TrialParticipant.builder()
                    .id(10L).trial(trial).competitorId(13L).competitorType(CompetitorType.ATHLETE).build();
            when(trialParticipantRepository.findAllDirectAndTeamTrialParticipations(13L)).thenReturn(List.of(tpAthlete));
            
            Athlete athlete = mockEligibleAthlete(13L, "Ali", "Reza");
            when(athleteRepository.findById(13L)).thenReturn(Optional.of(athlete));

            List<TrialParticipantResponse> results = trialParticipantService.getByAthleteId(13L);
            assertEquals(1, results.size());
            assertEquals("Ali Reza", results.get(0).getDisplayName());
        }
    }

    @Nested
    class RemoveMethodsTests {

        @Test
        void shouldRemoveAthlete() {
            when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
            when(trial.hasStarted()).thenReturn(false);

            TrialParticipant tp = TrialParticipant.builder()
                    .id(10L).trial(trial).competitorId(13L).competitorType(CompetitorType.ATHLETE).build();
            when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of(tp));

            assertDoesNotThrow(() -> trialParticipantService.removeAthlete(1L, 13L));
            verify(trialParticipantRepository).delete(tp);
        }

        @Test
        void shouldThrowWhenRemoveAthleteAndTrialStarted() {
            when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
            when(trial.hasStarted()).thenReturn(true);

            BusinessValidationException exception = assertThrows(BusinessValidationException.class, () -> trialParticipantService.removeAthlete(1L, 13L));
            assertEquals("Série déjà commencée.", exception.getMessage());
        }

        @Test
        void shouldRemoveTeam() {
            when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
            when(trial.hasStarted()).thenReturn(false);

            TrialParticipant tp = TrialParticipant.builder()
                    .id(11L).trial(trial).competitorId(21L).competitorType(CompetitorType.TEAM).build();
            when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of(tp));

            assertDoesNotThrow(() -> trialParticipantService.removeTeam(1L, 21L));
            verify(trialParticipantRepository).delete(tp);
        }
    }

    @Nested
    class GetEligibleTests {

        @Test
        void shouldGetEligibleAthletesForQualification() {
            when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
            when(trial.getRound().getName()).thenReturn(RoundName.QUALIFICATION_HEAT);
            when(trial.getCompetition().getId()).thenReturn(100L);

            com.ciblorgasport.competition.domain.Participation p = new com.ciblorgasport.competition.domain.Participation();
            p.setCompetitorType(CompetitorType.ATHLETE);
            p.setStatus(ParticipationStatus.CONFIRMED);
            p.setCompetitorId(13L);

            when(participationRepository.findByCompetition_Id(100L)).thenReturn(List.of(p));
            when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of());

            Athlete athlete = mockEligibleAthlete(13L, "Ali", "Reza");
            when(athleteRepository.findAllById(List.of(13L))).thenReturn(List.of(athlete));

            List<com.ciblorgasport.athlete.dto.AthleteResponse> results = trialParticipantService.getEligibleAthletes(1L);
            assertEquals(1, results.size());
            assertEquals("Ali", results.get(0).getFirstName());
        }

        @Test
        void shouldGetEligibleAthletesForFinal() {
            when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
            when(trial.getRound().getName()).thenReturn(RoundName.FINALE);
            when(trial.getCompetition()).thenReturn(new com.ciblorgasport.competition.domain.Competition());
            when(trial.getTrialName()).thenReturn(com.ciblorgasport.trial.domain.TrialName.HUNDRED_M_FREESTYLE);
            when(trial.getCategoryGender()).thenReturn(com.ciblorgasport.trial.domain.CategoryGender.MALE);

            when(trialParticipantRepository.findQualifiedCompetitorIds(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                    .thenReturn(List.of(13L));
            when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of());

            Athlete athlete = mockEligibleAthlete(13L, "Ali", "Reza");
            when(athleteRepository.findAllById(List.of(13L))).thenReturn(List.of(athlete));

            List<com.ciblorgasport.athlete.dto.AthleteResponse> results = trialParticipantService.getEligibleAthletes(1L);
            assertEquals(1, results.size());
        }

        @Test
        void shouldGetEligibleTeamsForQualification() {
            when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
            when(trial.getRound().getName()).thenReturn(RoundName.QUALIFICATION_HEAT);
            when(trial.getCompetition().getId()).thenReturn(100L);

            com.ciblorgasport.competition.domain.Participation p = new com.ciblorgasport.competition.domain.Participation();
            p.setCompetitorType(CompetitorType.TEAM);
            p.setStatus(ParticipationStatus.CONFIRMED);
            p.setCompetitorId(21L);

            when(participationRepository.findByCompetition_Id(100L)).thenReturn(List.of(p));
            when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of());

            Team team = mockEligibleTeam(21L, "Team Alpha", List.of(mockEligibleAthlete(13L, "Ali", "Reza")));
            when(teamRepository.findAllById(List.of(21L))).thenReturn(List.of(team));

            List<com.ciblorgasport.team.dto.TeamResponse> results = trialParticipantService.getEligibleTeams(1L);
            assertEquals(1, results.size());
            assertEquals("Team Alpha", results.get(0).getName());
        }
    }
}