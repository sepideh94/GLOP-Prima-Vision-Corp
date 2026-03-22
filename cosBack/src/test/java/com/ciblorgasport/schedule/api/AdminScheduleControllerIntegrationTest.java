package com.ciblorgasport.schedule.api;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import com.ciblorgasport.schedule.domain.VolunteerTask;
import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.schedule.dto.VolunteerScheduleSummary;
import com.ciblorgasport.user.domain.UserAccount;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@ExtendWith(MockitoExtension.class)
class AdminScheduleControllerIntegrationTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private UserAccount currentUser;

    @Mock
    private ScheduleService scheduleService;

    @InjectMocks
    private AdminScheduleController adminScheduleController;

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
                .standaloneSetup(adminScheduleController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(authenticationPrincipalResolver)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    @DisplayName("POST /api/admin/schedules/create-schedule -> should create volunteer schedules and return 201")
    void shouldCreateSchedules() throws Exception {
        ScheduleCreateRequest request = new ScheduleCreateRequest();
        request.setTask(VolunteerTask.ACCUEIL);
        request.setTitle("Mission accueil");
        request.setDescription("Accueil des participants");
        request.setStartTime(LocalDateTime.of(2026, 4, 10, 8, 0));
        request.setEndTime(LocalDateTime.of(2026, 4, 10, 12, 0));
        request.setSiteId(5L);
        request.setCompetitionId(10L);
        request.setAssignedUserIds(List.of(101L, 102L));

        ScheduleResponse first = ScheduleResponse.builder()
                .id(1L)
                .title("Mission accueil")
                .description("Accueil des participants")
                .startTime(LocalDateTime.of(2026, 4, 10, 8, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 12, 0))
                .type(ScheduleType.VOLONTEER)
                .status(Status.UPCOMING)
                .competitionId(10L)
                .competitionName("Compétition régionale")
                .assignedUserName("volunteer1")
                .build();

        ScheduleResponse second = ScheduleResponse.builder()
                .id(2L)
                .title("Mission accueil")
                .description("Accueil des participants")
                .startTime(LocalDateTime.of(2026, 4, 10, 8, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 12, 0))
                .type(ScheduleType.VOLONTEER)
                .status(Status.UPCOMING)
                .competitionId(10L)
                .competitionName("Compétition régionale")
                .assignedUserName("volunteer2")
                .build();

        when(scheduleService.createSchedules(any(ScheduleCreateRequest.class), any(UserAccount.class)))
                .thenReturn(List.of(first, second));

        mockMvc.perform(post("/api/admin/schedules/create-schedule")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Mission accueil"))
                .andExpect(jsonPath("$[0].type").value("VOLONTEER"))
                .andExpect(jsonPath("$[0].competitionId").value(10))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].assignedUserName").value("volunteer2"));

        verify(scheduleService).createSchedules(any(ScheduleCreateRequest.class), any(UserAccount.class));
    }

    @Test
    @DisplayName("GET /api/admin/schedules/volunteer-tasks -> should return volunteer tasks")
    void shouldGetVolunteerTasks() throws Exception {
        mockMvc.perform(get("/api/admin/schedules/volunteer-tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("ACCUEIL"))
                .andExpect(jsonPath("$[1]").value("ORIENTATION"))
                .andExpect(jsonPath("$[2]").value("TRANSPORT"));
    }

    @Test
    @DisplayName("GET /api/admin/schedules/volunteer/{volunteerId} -> should return volunteer schedule")
    void shouldGetVolunteerSchedule() throws Exception {
        Long volunteerId = 15L;

        VolunteerScheduleSummary response = VolunteerScheduleSummary.builder()
                .title("Mission logistique")
                .competitionName("Championnat national")
                .missionStart(LocalDateTime.of(2026, 5, 1, 9, 0))
                .missionEnd(LocalDateTime.of(2026, 5, 1, 13, 0))
                .siteAddress("12 rue Lille")
                .assignmentStatus("CONFIRMED")
                .occurringTrialNames(List.of("100m", "200m"))
                .build();

        when(scheduleService.getVolunteerSchedule(volunteerId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/admin/schedules/volunteer/{volunteerId}", volunteerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Mission logistique"))
                .andExpect(jsonPath("$[0].competitionName").value("Championnat national"))
                .andExpect(jsonPath("$[0].siteAddress").value("12 rue Lille"))
                .andExpect(jsonPath("$[0].assignmentStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$[0].occurringTrialNames[0]").value("100m"));

        verify(scheduleService).getVolunteerSchedule(volunteerId);
    }
}