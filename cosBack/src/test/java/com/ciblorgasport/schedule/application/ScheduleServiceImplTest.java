package com.ciblorgasport.schedule.application;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.schedule.ScheduleRepository;
import com.ciblorgasport.schedule.domain.ScheduleItem;
import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerAssignmentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceImplTest {

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private SiteRepository siteRepository;

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private UserAccountRepository userRepository;

    @Mock
    private VolonteerAssignmentRepository volonteerAssignmentRepository;

    @Mock
    private TrialRepository trialRepository;

    @Mock
    private VolonteerRepository volonteerRepository;

    @Mock
    private TrialParticipantRepository trialParticipantRepository;

    @InjectMocks
    private ScheduleServiceImpl scheduleService;

    private UserAccount currentUser;

    @BeforeEach
    void setUp() {
        currentUser = org.mockito.Mockito.mock(UserAccount.class);
        org.mockito.Mockito.lenient().when(currentUser.getId()).thenReturn(7L);
    }

    @Test
    @DisplayName("getSchedulesForUser should return mapped schedules for current user")
    void shouldReturnSchedulesForUser() {
        ScheduleItem item = new ScheduleItem();
        item.setId(1L);
        item.setTitle("Mission accueil");
        item.setDescription("Accueil des participants");
        item.setStartTime(LocalDateTime.of(2099, 4, 10, 8, 0));
        item.setEndTime(LocalDateTime.of(2099, 4, 10, 12, 0));
        item.setType(ScheduleType.VOLONTEER);
        item.setStatus(Status.UPCOMING);

        when(scheduleRepository.findByAssignedUserId(7L)).thenReturn(List.of(item));

        List<ScheduleResponse> result = scheduleService.getSchedulesForUser(currentUser);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getTitle()).isEqualTo("Mission accueil");
        assertThat(result.get(0).getDescription()).isEqualTo("Accueil des participants");
        assertThat(result.get(0).getType()).isEqualTo(ScheduleType.VOLONTEER);
        assertThat(result.get(0).getStatus()).isEqualTo(Status.UPCOMING);
        assertThat(result.get(0).getAssignedUserName()).isEqualTo("Général");
    }

    @Test
@DisplayName("getSchedulesForUser should return empty list when user has no schedules")
void shouldReturnEmptySchedulesForUser() {
    when(scheduleRepository.findByAssignedUserId(7L)).thenReturn(List.of());

    List<ScheduleResponse> result = scheduleService.getSchedulesForUser(currentUser);

    assertThat(result).isEmpty();
}

    @org.junit.jupiter.api.Nested
    @DisplayName("createSchedules Tests")
    class CreateSchedulesTests {
        @Test
        @DisplayName("Should throw AccessDeniedException if commissioner tries to create non-athlete schedule")
        void shouldThrowAccessDeniedForCommissioner() {
            when(currentUser.isCommissionner()).thenReturn(true);
            
            com.ciblorgasport.schedule.dto.ScheduleCreateRequest request = new com.ciblorgasport.schedule.dto.ScheduleCreateRequest();
            request.setType(ScheduleType.VOLONTEER);

            org.junit.jupiter.api.Assertions.assertThrows(org.springframework.security.access.AccessDeniedException.class, 
                () -> scheduleService.createSchedules(request, currentUser));
        }

        @Test
        @DisplayName("Should throw RuntimeException if competition not found")
        void shouldThrowRuntimeIfCompetitionNotFound() {
            when(currentUser.isCommissionner()).thenReturn(false);
            
            com.ciblorgasport.schedule.dto.ScheduleCreateRequest request = new com.ciblorgasport.schedule.dto.ScheduleCreateRequest();
            request.setType(ScheduleType.VOLONTEER);
            request.setCompetitionId(99L);

            when(competitionRepository.findById(99L)).thenReturn(java.util.Optional.empty());

            org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, 
                () -> scheduleService.createSchedules(request, currentUser));
        }

        @Test
        @DisplayName("Should throw RuntimeException if dates are outside competition boundaries")
        void shouldThrowRuntimeIfDatesOutsideCompetition() {
            when(currentUser.isCommissionner()).thenReturn(false);
            
            com.ciblorgasport.schedule.dto.ScheduleCreateRequest request = new com.ciblorgasport.schedule.dto.ScheduleCreateRequest();
            request.setType(ScheduleType.GENERAL);
            request.setCompetitionId(1L);
            request.setStartTime(LocalDateTime.of(2023, 1, 1, 10, 0));
            request.setEndTime(LocalDateTime.of(2023, 1, 1, 12, 0));

            com.ciblorgasport.competition.domain.Competition comp = new com.ciblorgasport.competition.domain.Competition();
            comp.setStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));
            comp.setEndDate(LocalDateTime.of(2024, 12, 31, 23, 59));

            when(competitionRepository.findById(1L)).thenReturn(java.util.Optional.of(comp));

            org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, 
                () -> scheduleService.createSchedules(request, currentUser));
        }

        @Test
        @DisplayName("Should create single general schedule if no assigned users")
        void shouldCreateGeneralSchedule() {
            when(currentUser.isCommissionner()).thenReturn(false);
            
            com.ciblorgasport.schedule.dto.ScheduleCreateRequest request = new com.ciblorgasport.schedule.dto.ScheduleCreateRequest();
            request.setTitle("General Briefing");
            request.setType(ScheduleType.GENERAL);
            request.setCompetitionId(1L);
            request.setStartTime(LocalDateTime.of(2024, 5, 5, 10, 0));
            request.setEndTime(LocalDateTime.of(2024, 5, 5, 12, 0));

            com.ciblorgasport.competition.domain.Competition comp = new com.ciblorgasport.competition.domain.Competition();
            comp.setId(1L);
            comp.setName("Olympics");
            comp.setStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));
            comp.setEndDate(LocalDateTime.of(2024, 12, 31, 23, 59));

            when(competitionRepository.findById(1L)).thenReturn(java.util.Optional.of(comp));
            when(scheduleRepository.save(org.mockito.ArgumentMatchers.any(ScheduleItem.class)))
                .thenAnswer(invocation -> {
                    ScheduleItem item = invocation.getArgument(0);
                    item.setId(100L);
                    return item;
                });

            List<ScheduleResponse> results = scheduleService.createSchedules(request, currentUser);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getTitle()).isEqualTo("General Briefing");
        }

        @Test
        @DisplayName("Should create multiple schedules and assignments if assigned users provided")
        void shouldCreateMultipleSchedules() {
            when(currentUser.isCommissionner()).thenReturn(false);
            
            com.ciblorgasport.schedule.dto.ScheduleCreateRequest request = new com.ciblorgasport.schedule.dto.ScheduleCreateRequest();
            request.setTitle("Volunteer Duty");
            request.setType(ScheduleType.VOLONTEER);
            request.setCompetitionId(1L);
            request.setStartTime(LocalDateTime.of(2024, 5, 5, 10, 0));
            request.setEndTime(LocalDateTime.of(2024, 5, 5, 12, 0));
            request.setAssignedUserIds(List.of(10L, 11L));

            com.ciblorgasport.competition.domain.Competition comp = new com.ciblorgasport.competition.domain.Competition();
            comp.setId(1L);
            comp.setStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));
            comp.setEndDate(LocalDateTime.of(2024, 12, 31, 23, 59));

            when(competitionRepository.findById(1L)).thenReturn(java.util.Optional.of(comp));
            
            UserAccount user10 = org.mockito.Mockito.mock(UserAccount.class);
            UserAccount user11 = org.mockito.Mockito.mock(UserAccount.class);
            when(userRepository.findById(10L)).thenReturn(java.util.Optional.of(user10));
            when(userRepository.findById(11L)).thenReturn(java.util.Optional.of(user11));

            com.ciblorgasport.volonteer.domain.Volonteer vol10 = new com.ciblorgasport.volonteer.domain.Volonteer();
            com.ciblorgasport.volonteer.domain.Volonteer vol11 = new com.ciblorgasport.volonteer.domain.Volonteer();
            when(volonteerRepository.findById(10L)).thenReturn(java.util.Optional.of(vol10));
            when(volonteerRepository.findById(11L)).thenReturn(java.util.Optional.of(vol11));

            when(scheduleRepository.save(org.mockito.ArgumentMatchers.any(ScheduleItem.class)))
                .thenAnswer(invocation -> {
                    ScheduleItem item = invocation.getArgument(0);
                    item.setId((long)(Math.random() * 1000));
                    return item;
                });

            List<ScheduleResponse> results = scheduleService.createSchedules(request, currentUser);

            assertThat(results).hasSize(2);
            org.mockito.Mockito.verify(volonteerAssignmentRepository, org.mockito.Mockito.times(2))
                .save(org.mockito.ArgumentMatchers.any());
        }
    }

    @org.junit.jupiter.api.Nested
    @DisplayName("updateAllSchedulesStatus Tests")
    class UpdateAllSchedulesStatusTests {
        @Test
        @DisplayName("Should update status if calculated status differs")
        void shouldUpdateStatus() {
            ScheduleItem item1 = new ScheduleItem();
            item1.setId(1L);
            item1.setStartTime(LocalDateTime.now().minusHours(2));
            item1.setEndTime(LocalDateTime.now().minusHours(1));
            item1.setStatus(Status.IN_PROGRESS);

            ScheduleItem item2 = new ScheduleItem();
            item2.setId(2L);
            item2.setStartTime(LocalDateTime.now().plusHours(1));
            item2.setEndTime(LocalDateTime.now().plusHours(2));
            item2.setStatus(Status.UPCOMING);

            when(scheduleRepository.findAll()).thenReturn(List.of(item1, item2));

            scheduleService.updateAllSchedulesStatus();

            assertThat(item1.getStatus()).isEqualTo(Status.COMPLETED);
            assertThat(item2.getStatus()).isEqualTo(Status.UPCOMING);
            org.mockito.Mockito.verify(scheduleRepository, org.mockito.Mockito.times(1)).save(item1);
        }
    }

    @org.junit.jupiter.api.Nested
    @DisplayName("getVolunteerSchedule Tests")
    class GetVolunteerScheduleTests {
        @Test
        @DisplayName("Should return summary even if no site or end time")
        void shouldReturnEmptySummary() {
            com.ciblorgasport.volonteer.domain.VolonteerAssignment va = new com.ciblorgasport.volonteer.domain.VolonteerAssignment();
            va.setTitle("Test Title");
            va.setStartTime(LocalDateTime.now());
            
            when(volonteerAssignmentRepository.findByVolonteerId(10L)).thenReturn(List.of(va));

            List<com.ciblorgasport.schedule.dto.VolunteerScheduleSummary> results = scheduleService.getVolunteerSchedule(10L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getSiteAddress()).isEqualTo("Lieu non défini");
        }

        @Test
        @DisplayName("Should return full summary with trials")
        void shouldReturnFullSummary() {
            com.ciblorgasport.volonteer.domain.VolonteerAssignment va = new com.ciblorgasport.volonteer.domain.VolonteerAssignment();
            va.setTitle("Test Title");
            LocalDateTime start = LocalDateTime.of(2025, 1, 1, 8, 0);
            LocalDateTime end = LocalDateTime.of(2025, 1, 1, 12, 0);
            va.setStartTime(start);
            va.setEndTime(end);
            com.ciblorgasport.site.domain.Site site = new com.ciblorgasport.site.domain.Site();
            site.setId(100L);
            site.setAdress("Stade Olympique");
            va.setSite(site);
            com.ciblorgasport.competition.domain.Competition comp = new com.ciblorgasport.competition.domain.Competition();
            comp.setName("Olympics");
            va.setCompetition(comp);
            va.setStatus(com.ciblorgasport.competition.domain.ParticipationStatus.CONFIRMED);

            when(volonteerAssignmentRepository.findByVolonteerId(10L)).thenReturn(List.of(va));

            com.ciblorgasport.trial.domain.Trial trialMock = org.mockito.Mockito.mock(com.ciblorgasport.trial.domain.Trial.class);
            when(trialMock.getName()).thenReturn("100m Dash");
            when(trialRepository.findBySiteAndPeriod(100L, start.toLocalDate(), start.toLocalTime(), end.toLocalDate(), end.toLocalTime()))
                .thenReturn(List.of(trialMock));

            List<com.ciblorgasport.schedule.dto.VolunteerScheduleSummary> results = scheduleService.getVolunteerSchedule(10L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getSiteAddress()).isEqualTo("Stade Olympique");
            assertThat(results.get(0).getOccurringTrialNames()).containsExactly("100m Dash");
        }
    }

    @org.junit.jupiter.api.Nested
    @DisplayName("getAthleteScheduleByCompetition Tests")
    class GetAthleteScheduleByCompetitionTests {
        @Test
        @DisplayName("Should return sorted athlete schedules")
        void shouldReturnAthleteSchedules() {
            com.ciblorgasport.trial.domain.TrialParticipant tp1 = org.mockito.Mockito.mock(com.ciblorgasport.trial.domain.TrialParticipant.class);
            com.ciblorgasport.trial.domain.Trial t1 = org.mockito.Mockito.mock(com.ciblorgasport.trial.domain.Trial.class);
            com.ciblorgasport.competition.domain.Competition c1 = org.mockito.Mockito.mock(com.ciblorgasport.competition.domain.Competition.class);
            
            when(tp1.getTrial()).thenReturn(t1);
            when(tp1.getId()).thenReturn(1L);
            when(t1.getCompetition()).thenReturn(c1);
            when(c1.getId()).thenReturn(99L);
            when(c1.getName()).thenReturn("Olympics");
            when(t1.getName()).thenReturn("100m Sprint");
            
            com.ciblorgasport.trial.round.domain.Round round = org.mockito.Mockito.mock(com.ciblorgasport.trial.round.domain.Round.class);
            when(round.getName()).thenReturn(com.ciblorgasport.trial.round.domain.RoundName.FINALE);
            when(t1.getRound()).thenReturn(round);
            when(t1.getStartDate()).thenReturn(java.time.LocalDate.of(2025, 1, 2));
            when(t1.getStartHour()).thenReturn(java.time.LocalTime.of(10, 0));
            when(t1.getEndDate()).thenReturn(java.time.LocalDate.of(2025, 1, 2));
            when(t1.getEndHour()).thenReturn(java.time.LocalTime.of(10, 15));
            when(t1.getSite()).thenReturn(null);
            when(t1.getStatus()).thenReturn(com.ciblorgasport.common.model.Status.UPCOMING);
            when(t1.getId()).thenReturn(101L);
            
            when(trialParticipantRepository.findAllDirectAndTeamTrialParticipations(13L)).thenReturn(List.of(tp1));

            List<com.ciblorgasport.schedule.dto.AthleteTrialScheduleResponse> results = scheduleService.getAthleteScheduleByCompetition(13L, 99L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).trialName()).isEqualTo("100m Sprint");
        }
    }
}