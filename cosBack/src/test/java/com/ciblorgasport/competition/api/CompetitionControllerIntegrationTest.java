package com.ciblorgasport.competition.api;

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
import static org.springframework.http.MediaType.APPLICATION_JSON;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.ciblorgasport.common.exception.GlobalExceptionHandler;
import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.application.CompetitionService;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.CompetitionUpdateRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@ExtendWith(MockitoExtension.class)
class CompetitionControllerIntegrationTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private CompetitionService competitionService;

    @InjectMocks
    private CompetitionController competitionController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(competitionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    @DisplayName("POST /api/admin/competitions -> should create competition and return 201")
    void shouldCreateCompetition() throws Exception {
        CompetitionCreateRequest request = new CompetitionCreateRequest();
        request.setName("Competition natation");
        request.setDescription("Finale régionale");
        request.setStartDate(LocalDateTime.of(2026, 4, 10, 9, 0));
        request.setEndDate(LocalDateTime.of(2026, 4, 10, 18, 0));
        request.setParentEventId(100L);

        CompetitionResponse response = CompetitionResponse.builder()
                .id(1L)
                .name("Competition natation")
                .description("Finale régionale")
                .startDate(LocalDateTime.of(2026, 4, 10, 9, 0))
                .endDate(LocalDateTime.of(2026, 4, 10, 18, 0))
                .parentEventId(100L)
                .status(Status.UPCOMING)
                .statusLabel("À venir")
                .build();

        when(competitionService.createCompetition(any(CompetitionCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/admin/competitions")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Competition natation"))
                .andExpect(jsonPath("$.description").value("Finale régionale"))
                .andExpect(jsonPath("$.parentEventId").value(100))
                .andExpect(jsonPath("$.status").value("UPCOMING"))
                .andExpect(jsonPath("$.statusLabel").value("À venir"));

        verify(competitionService).createCompetition(any(CompetitionCreateRequest.class));
    }

    @Test
    @DisplayName("PUT /api/admin/competitions/{id} -> should update competition and return 200")
    void shouldUpdateCompetition() throws Exception {
        Long competitionId = 5L;

        CompetitionUpdateRequest request = new CompetitionUpdateRequest();
        request.setName("Competition athlétisme");
        request.setDescription("Mise à jour du planning");
        request.setStartDate(LocalDateTime.of(2026, 5, 2, 8, 30));
        request.setEndDate(LocalDateTime.of(2026, 5, 2, 19, 0));

        CompetitionResponse response = CompetitionResponse.builder()
                .id(competitionId)
                .name("Competition athlétisme")
                .description("Mise à jour du planning")
                .startDate(LocalDateTime.of(2026, 5, 2, 8, 30))
                .endDate(LocalDateTime.of(2026, 5, 2, 19, 0))
                .parentEventId(200L)
                .status(Status.UPCOMING)
                .statusLabel("À venir")
                .build();

        when(competitionService.updateCompetition(eq(competitionId), any(CompetitionUpdateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/admin/competitions/{id}", competitionId)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(competitionId))
                .andExpect(jsonPath("$.name").value("Competition athlétisme"))
                .andExpect(jsonPath("$.description").value("Mise à jour du planning"))
                .andExpect(jsonPath("$.parentEventId").value(200))
                .andExpect(jsonPath("$.status").value("UPCOMING"));

        verify(competitionService).updateCompetition(eq(competitionId), any(CompetitionUpdateRequest.class));
    }

    @Test
    @DisplayName("GET /api/admin/competitions/{id} -> should return competition by id")
    void shouldGetCompetitionById() throws Exception {
        Long competitionId = 9L;

        CompetitionResponse response = CompetitionResponse.builder()
                .id(competitionId)
                .name("Tournoi tennis")
                .description("Simple homme")
                .startDate(LocalDateTime.of(2026, 6, 1, 10, 0))
                .endDate(LocalDateTime.of(2026, 6, 1, 17, 0))
                .parentEventId(300L)
                .status(Status.UPCOMING)
                .statusLabel("À venir")
                .build();

        when(competitionService.getCompetitionById(competitionId)).thenReturn(response);

        mockMvc.perform(get("/api/admin/competitions/{id}", competitionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(competitionId))
                .andExpect(jsonPath("$.name").value("Tournoi tennis"))
                .andExpect(jsonPath("$.description").value("Simple homme"))
                .andExpect(jsonPath("$.parentEventId").value(300))
                .andExpect(jsonPath("$.status").value("UPCOMING"));

        verify(competitionService).getCompetitionById(competitionId);
    }

    @Test
    @DisplayName("GET /api/admin/competitions/by-event/{eventId} -> should return competitions for event")
    void shouldGetCompetitionsByEventId() throws Exception {
        Long eventId = 77L;

        CompetitionResponse first = CompetitionResponse.builder()
                .id(1L)
                .name("Compétition 1")
                .description("Desc 1")
                .startDate(LocalDateTime.of(2026, 7, 1, 9, 0))
                .endDate(LocalDateTime.of(2026, 7, 1, 12, 0))
                .parentEventId(eventId)
                .status(Status.UPCOMING)
                .statusLabel("À venir")
                .build();

        CompetitionResponse second = CompetitionResponse.builder()
                .id(2L)
                .name("Compétition 2")
                .description("Desc 2")
                .startDate(LocalDateTime.of(2026, 7, 2, 14, 0))
                .endDate(LocalDateTime.of(2026, 7, 2, 18, 0))
                .parentEventId(eventId)
                .status(Status.UPCOMING)
                .statusLabel("À venir")
                .build();

        when(competitionService.getCompetitionsByEventId(eventId)).thenReturn(List.of(first, second));

        mockMvc.perform(get("/api/admin/competitions/by-event/{eventId}", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Compétition 1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Compétition 2"));

        verify(competitionService).getCompetitionsByEventId(eventId);
    }

    @Test
    @DisplayName("PUT /api/admin/competitions/{id} -> should return 400 when body is invalid")
    void shouldReturnBadRequestWhenUpdatePayloadIsInvalid() throws Exception {
        Long competitionId = 12L;

        String invalidJson = """
            {
              "name": "",
              "description": "desc",
              "startDate": null,
              "endDate": null
            }
            """;

        mockMvc.perform(put("/api/admin/competitions/{id}", competitionId)
                        .contentType(APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Les données envoyées ne sont pas valides."))
                .andExpect(jsonPath("$.validationErrors.name").value("Le nom de la compétition est obligatoire."))
                .andExpect(jsonPath("$.validationErrors.startDate").value("La date de début est obligatoire."))
                .andExpect(jsonPath("$.validationErrors.endDate").value("La date de fin est obligatoire."));
    }
}