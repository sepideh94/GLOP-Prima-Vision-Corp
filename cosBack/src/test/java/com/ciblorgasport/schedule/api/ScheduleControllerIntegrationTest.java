package com.ciblorgasport.schedule.api;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.ciblorgasport.common.exception.GlobalExceptionHandler;
import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.schedule.application.ScheduleService;
import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.schedule.dto.AthleteTrialScheduleResponse;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.competition.application.ParticipationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@ExtendWith(MockitoExtension.class)
class ScheduleControllerIntegrationTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private UserAccount currentUser;

    @Mock
    private ScheduleService scheduleService;

    @Mock
    private ParticipationService participationService;

    @InjectMocks
    private ScheduleController scheduleController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        currentUser = org.mockito.Mockito.mock(UserAccount.class);

        HandlerMethodArgumentResolver authenticationPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class)
                        && UserAccount.class.isAssignableFrom(parameter.getParameterType());
            }

            @Override
            public Object resolveArgument(
                    MethodParameter parameter,
                    ModelAndViewContainer mavContainer,
                    NativeWebRequest webRequest,
                    WebDataBinderFactory binderFactory) {
                return currentUser;
            }
        };

        mockMvc = MockMvcBuilders
                .standaloneSetup(scheduleController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(authenticationPrincipalResolver)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    @DisplayName("GET /api/schedule/volunteer/mon-planning -> should return current user schedule")
    void shouldGetMySchedule() throws Exception {
        ScheduleResponse response = ScheduleResponse.builder()
                .id(30L)
                .title("Mission sécurité")
                .description("Surveillance entrée")
                .startTime(LocalDateTime.of(2026, 6, 2, 10, 0))
                .endTime(LocalDateTime.of(2026, 6, 2, 14, 0))
                .type(ScheduleType.VOLONTEER)
                .status(Status.UPCOMING)
                .competitionId(8L)
                .competitionName("Open régional")
                .assignedUserName("me")
                .build();

        when(scheduleService.getSchedulesForUser(any(UserAccount.class))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/schedule/volunteer/mon-planning"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(30))
                .andExpect(jsonPath("$[0].title").value("Mission sécurité"))
                .andExpect(jsonPath("$[0].type").value("VOLONTEER"))
                .andExpect(jsonPath("$[0].competitionName").value("Open régional"));

        verify(scheduleService).getSchedulesForUser(any(UserAccount.class));
    }

    @Test
    @DisplayName("GET /api/schedule/athlete/competition/{competitionId} -> should return athlete competition schedule")
    void shouldGetAthleteScheduleByCompetition() throws Exception {
        Long competitionId = 44L;
        Long athleteId = 7L;

        when(currentUser.getId()).thenReturn(athleteId);

        when(participationService.isConfirmed(eq(athleteId), eq(competitionId))).thenReturn(true);

        AthleteTrialScheduleResponse response = new AthleteTrialScheduleResponse(
                101L,
                202L,
                "100m finale",
                "FINAL",
                LocalDateTime.of(2026, 7, 10, 16, 0),
                LocalDateTime.of(2026, 7, 10, 16, 30),
                "Stade Pierre Mauroy",
                "UPCOMING",
                "CONFIRMED",
                "Championnat de France"
        );

        when(scheduleService.getAthleteScheduleByCompetition(eq(athleteId), eq(competitionId)))
                .thenReturn(List.of(response));
        
        when(participationService.isConfirmed(7L, competitionId)).thenReturn(true);

        mockMvc.perform(get("/api/schedule/athlete/competition/{competitionId}", competitionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].trialId").value(101))
                .andExpect(jsonPath("$[0].trialParticipantId").value(202))
                .andExpect(jsonPath("$[0].trialName").value("100m finale"))
                .andExpect(jsonPath("$[0].phase").value("FINAL"))
                .andExpect(jsonPath("$[0].siteAddress").value("Stade Pierre Mauroy"))
                .andExpect(jsonPath("$[0].participantStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$[0].competitionName").value("Championnat de France"));

        verify(participationService).isConfirmed(athleteId, competitionId);
        verify(scheduleService).getAthleteScheduleByCompetition(athleteId, competitionId);
    }
}