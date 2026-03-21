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
        when(currentUser.getId()).thenReturn(7L);
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
}