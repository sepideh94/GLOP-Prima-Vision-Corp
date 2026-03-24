package com.ciblorgasport.trial.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.ciblorgasport.commissionner.Commissionner;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.common.exception.GlobalExceptionHandler;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.trial.application.RecordTrialResultsUseCase;
import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.input.ResultInputStrategy;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.infrastructure.SimulatedSensorDataReader;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.user.application.UserAccountService;

/**
 * Tests unitaires de la couche contrôleur pour l'enregistrement des résultats.
 * <p>
 * Note : le GlobalExceptionHandler est importé explicitement pour valider
 * les codes HTTP retournés en cas d'erreur.
 *
 * Attention : le GlobalExceptionHandler gère les exceptions du package
 * {@code com.ciblorgasport.common.exception}. Si le use case lève des exceptions
 * du package {@code com.ciblorgasport.trial.domain.exception}, elles ne seront
 * pas capturées par les handlers 404/409 et remonteront en 500. Ces tests
 * utilise les exceptions common.exception pour tester le handler correctement.
 */
@WebMvcTest(CommissionerTrialController.class)
@org.springframework.test.context.ActiveProfiles("test")
@Import({SecurityDisabledConfig.class, GlobalExceptionHandler.class})
@DisplayName("CommissionerTrialController — enregistrement des résultats")
class CommissionerTrialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private RecordTrialResultsUseCase recordTrialResultsUseCase;
    @MockitoBean private TrialResultService trialResultService;
    @MockitoBean private SimulatedSensorDataReader simulatedSensorDataReader;
    @MockitoBean private TrialParticipantRepository trialParticipantRepository;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserAccountService userAccountService;

    // =========================================================================
    // POST /api/commissioner/trials/{id}/results — saisie manuelle
    // =========================================================================

    @Nested
    @DisplayName("POST /api/commissioner/trials/{id}/results")
    class RecordResults {

        @Test
        @DisplayName("200 — saisie manuelle pour athlètes individuels, retourne classement")
        void shouldReturn200WithRankedAthleteResults() throws Exception {
            List<ResultResponse> ranked = List.of(
                    athleteResult(1L, 1, "10.01s", false),
                    athleteResult(2L, 2, "10.05s", false)
            );
            given(trialResultService.getResultsByTrialId(7L)).willReturn(ranked);

            String body = """
                    {
                      "performanceType": "TIME",
                      "results": [
                        { "trialParticipantId": 1, "performanceValue": 10.01 },
                        { "trialParticipantId": 2, "performanceValue": 10.05 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 7L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].rank").value(1))
                    .andExpect(jsonPath("$[0].tie").value(false))
                    .andExpect(jsonPath("$[0].performance").value("10.01s"))
                    .andExpect(jsonPath("$[0].participant.competitorType").value("ATHLETE"))
                    .andExpect(jsonPath("$[1].rank").value(2));

            verify(recordTrialResultsUseCase).recordManual(eq(7L), anyList(), eq(PerformanceType.TIME));
            verify(trialResultService).getResultsByTrialId(7L);
        }

        @Test
        @DisplayName("200 — saisie manuelle pour équipes, retourne classement avec membres")
        void shouldReturn200WithRankedTeamResults() throws Exception {
            List<ResultResponse> ranked = List.of(
                    teamResult(1L, 1, "9.75 pts"),
                    teamResult(2L, 2, "8.50 pts")
            );
            given(trialResultService.getResultsByTrialId(8L)).willReturn(ranked);

            String body = """
                    {
                      "performanceType": "POINTS",
                      "results": [
                        { "trialParticipantId": 10, "performanceValue": 9.75 },
                        { "trialParticipantId": 20, "performanceValue": 8.50 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 8L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].performanceType").value("POINTS"))
                    .andExpect(jsonPath("$[0].participant.competitorType").value("TEAM"))
                    .andExpect(jsonPath("$[0].participant.members.length()").value(2))
                    .andExpect(jsonPath("$[0].participant.members[0].firstName").value("Alice"));

            verify(recordTrialResultsUseCase).recordManual(eq(8L), anyList(), eq(PerformanceType.POINTS));
        }

        @Test
        @DisplayName("200 — ex aequo : tie=true sur les participants à égalité")
        void shouldReturn200WithTieFlagWhenEqualPerformances() throws Exception {
            List<ResultResponse> ranked = List.of(
                    athleteResult(1L, 1, "10.01s", true),
                    athleteResult(2L, 1, "10.01s", true),
                    athleteResult(3L, 3, "10.05s", false)
            );
            given(trialResultService.getResultsByTrialId(7L)).willReturn(ranked);

            String body = """
                    {
                      "performanceType": "TIME",
                      "results": [
                        { "trialParticipantId": 1, "performanceValue": 10.01 },
                        { "trialParticipantId": 2, "performanceValue": 10.01 },
                        { "trialParticipantId": 3, "performanceValue": 10.05 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 7L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].rank").value(1))
                    .andExpect(jsonPath("$[0].tie").value(true))
                    .andExpect(jsonPath("$[1].rank").value(1))
                    .andExpect(jsonPath("$[1].tie").value(true))
                    .andExpect(jsonPath("$[2].rank").value(3))
                    .andExpect(jsonPath("$[2].tie").value(false));
        }

        @Test
        @DisplayName("409 — épreuve non terminée (TrialNotCompletedException)")
        void shouldReturn409WhenTrialNotCompleted() throws Exception {
            given(recordTrialResultsUseCase.recordManual(eq(5L), anyList(), any()))
                    .willThrow(new com.ciblorgasport.common.exception.TrialNotCompletedException(
                            5L, com.ciblorgasport.common.model.Status.UPCOMING));

            String body = """
                    {
                      "performanceType": "TIME",
                      "results": [
                        { "trialParticipantId": 1, "performanceValue": 10.01 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 5L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.status").value(409));

            verifyNoInteractions(trialResultService);
        }

        @Test
        @DisplayName("404 — épreuve introuvable (TrialNotFoundException)")
        void shouldReturn404WhenTrialNotFound() throws Exception {
            given(recordTrialResultsUseCase.recordManual(eq(99L), anyList(), any()))
                    .willThrow(new com.ciblorgasport.common.exception.TrialNotFoundException(99L));

            String body = """
                    {
                      "performanceType": "TIME",
                      "results": [
                        { "trialParticipantId": 1, "performanceValue": 10.01 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 99L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));

            verifyNoInteractions(trialResultService);
        }

        @Test
        @DisplayName("400 — validation : performanceType manquant")
        void shouldReturn400WhenPerformanceTypeMissing() throws Exception {
            String body = """
                    {
                      "results": [
                        { "trialParticipantId": 1, "performanceValue": 10.01 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 7L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.performanceType").exists());

            verifyNoInteractions(recordTrialResultsUseCase, trialResultService);
        }

        @Test
        @DisplayName("400 — validation : liste de résultats vide")
        void shouldReturn400WhenResultsListIsEmpty() throws Exception {
            String body = """
                    {
                      "performanceType": "TIME",
                      "results": []
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 7L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.results").exists());

            verifyNoInteractions(recordTrialResultsUseCase, trialResultService);
        }

        @Test
        @DisplayName("400 — validation : trialParticipantId manquant dans un résultat")
        void shouldReturn400WhenParticipantIdMissing() throws Exception {
            String body = """
                    {
                      "performanceType": "TIME",
                      "results": [
                        { "performanceValue": 10.01 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 7L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(recordTrialResultsUseCase, trialResultService);
        }

        @Test
        @DisplayName("400 — validation : performanceValue négative")
        void shouldReturn400WhenPerformanceValueNegative() throws Exception {
            String body = """
                    {
                      "performanceType": "TIME",
                      "results": [
                        { "trialParticipantId": 1, "performanceValue": -1.00 }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/commissioner/trials/{id}/results", 7L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(recordTrialResultsUseCase, trialResultService);
        }
    }

    // =========================================================================
    // POST /api/commissioner/trials/{id}/simulate-results — simulation capteur
    // =========================================================================

    @Nested
    @DisplayName("POST /api/commissioner/trials/{id}/simulate-results")
    class SimulateResults {

        @Test
        @DisplayName("200 — simulation TIME : retourne classement par temps")
        void shouldReturn200WithTimeResults() throws Exception {
            given(trialParticipantRepository.findByTrialId(7L)).willReturn(List.of());
            List<ResultResponse> ranked = List.of(
                    athleteResult(1L, 1, "9.87s", false),
                    athleteResult(2L, 2, "10.34s", false)
            );
            given(trialResultService.getResultsByTrialId(7L)).willReturn(ranked);

            mockMvc.perform(post("/api/commissioner/trials/{id}/simulate-results", 7L)
                            .param("performanceType", "TIME"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].performanceType").value("TIME"))
                    .andExpect(jsonPath("$[0].rank").value(1));

            verify(recordTrialResultsUseCase).execute(eq(7L), any(ResultInputStrategy.class));
            verify(trialResultService).getResultsByTrialId(7L);
        }

        @Test
        @DisplayName("200 — simulation POINTS : retourne classement par points")
        void shouldReturn200WithPointsResults() throws Exception {
            given(trialParticipantRepository.findByTrialId(8L)).willReturn(List.of());
            List<ResultResponse> ranked = List.of(
                    teamResult(1L, 1, "9.20 pts"),
                    teamResult(2L, 2, "7.40 pts")
            );
            given(trialResultService.getResultsByTrialId(8L)).willReturn(ranked);

            mockMvc.perform(post("/api/commissioner/trials/{id}/simulate-results", 8L)
                            .param("performanceType", "POINTS"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].performanceType").value("POINTS"));

            verify(recordTrialResultsUseCase).execute(eq(8L), any(ResultInputStrategy.class));
        }

        @Test
        @DisplayName("200 — performanceType par défaut : TIME si non précisé")
        void shouldDefaultToTimePerformanceType() throws Exception {
            given(trialParticipantRepository.findByTrialId(7L)).willReturn(List.of());
            given(trialResultService.getResultsByTrialId(7L)).willReturn(List.of());

            mockMvc.perform(post("/api/commissioner/trials/{id}/simulate-results", 7L))
                    .andExpect(status().isOk());

            verify(recordTrialResultsUseCase).execute(eq(7L), any(ResultInputStrategy.class));
        }

        @Test
        @DisplayName("409 — épreuve non terminée (TrialNotCompletedException)")
        void shouldReturn409WhenTrialNotCompleted() throws Exception {
            given(trialParticipantRepository.findByTrialId(5L)).willReturn(List.of());
            given(recordTrialResultsUseCase.execute(eq(5L), any()))
                    .willThrow(new com.ciblorgasport.common.exception.TrialNotCompletedException(
                            5L, com.ciblorgasport.common.model.Status.UPCOMING));

            mockMvc.perform(post("/api/commissioner/trials/{id}/simulate-results", 5L))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.status").value(409));

            verifyNoInteractions(trialResultService);
        }
    }

    // =========================================================================
    // PUT /api/commissioner/trials/{id}/results — modification du classement
    // =========================================================================

    @Nested
    @DisplayName("PUT /api/commissioner/trials/{id}/results")
    class UpdateResults {

        private static final String BODY = """
                {
                  "performanceType": "TIME",
                  "results": [
                    { "trialParticipantId": 1, "performanceValue": 10.01 },
                    { "trialParticipantId": 2, "performanceValue": 10.05 }
                  ]
                }
                """;

        @Test
        @DisplayName("200 — modification autorisée le jour même, retourne classement recalculé")
        void shouldReturn200WhenUpdateAllowed() throws Exception {
            List<ResultResponse> ranked = List.of(
                    athleteResult(1L, 1, "10.01s", false),
                    athleteResult(2L, 2, "10.05s", false)
            );
            given(trialResultService.getResultsByTrialId(7L)).willReturn(ranked);

            mockMvc.perform(put("/api/commissioner/trials/{id}/results", 7L)
                            .with(authentication(mockPrincipal()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(BODY))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].rank").value(1));

            verify(recordTrialResultsUseCase).updateManual(eq(7L), anyList(), eq(PerformanceType.TIME), eq("Jean Commissaire"));
            verify(trialResultService).getResultsByTrialId(7L);
        }

        @Test
        @DisplayName("400 — date de l'épreuve dépassée (IllegalStateException)")
        void shouldReturn400WhenEndDatePast() throws Exception {
            given(recordTrialResultsUseCase.updateManual(eq(7L), anyList(), any(), anyString()))
                    .willThrow(new IllegalStateException("La modification des résultats n'est autorisée que le jour même de l'épreuve."));

            mockMvc.perform(put("/api/commissioner/trials/{id}/results", 7L)
                            .with(authentication(mockPrincipal()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(BODY))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400));

            verifyNoInteractions(trialResultService);
        }

        @Test
        @DisplayName("404 — épreuve introuvable (TrialNotFoundException)")
        void shouldReturn404WhenTrialNotFound() throws Exception {
            given(recordTrialResultsUseCase.updateManual(eq(99L), anyList(), any(), anyString()))
                    .willThrow(new com.ciblorgasport.common.exception.TrialNotFoundException(99L));

            mockMvc.perform(put("/api/commissioner/trials/{id}/results", 99L)
                            .with(authentication(mockPrincipal()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(BODY))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));

            verifyNoInteractions(trialResultService);
        }

        @Test
        @DisplayName("409 — épreuve non terminée (TrialNotCompletedException)")
        void shouldReturn409WhenTrialNotCompleted() throws Exception {
            given(recordTrialResultsUseCase.updateManual(eq(5L), anyList(), any(), anyString()))
                    .willThrow(new com.ciblorgasport.common.exception.TrialNotCompletedException(
                            5L, com.ciblorgasport.common.model.Status.UPCOMING));

            mockMvc.perform(put("/api/commissioner/trials/{id}/results", 5L)
                            .with(authentication(mockPrincipal()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(BODY))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.status").value(409));

            verifyNoInteractions(trialResultService);
        }

        @Test
        @DisplayName("400 — validation : liste de résultats vide")
        void shouldReturn400WhenResultsListIsEmpty() throws Exception {
            String body = """
                    {
                      "performanceType": "TIME",
                      "results": []
                    }
                    """;

            mockMvc.perform(put("/api/commissioner/trials/{id}/results", 7L)
                            .with(authentication(mockPrincipal()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.results").exists());

            verifyNoInteractions(recordTrialResultsUseCase, trialResultService);
        }
    }

    // =========================================================================
    // Builders
    // =========================================================================

    private static Authentication mockPrincipal() {
        Commissionner commissioner = new Commissionner();
        commissioner.setFirstName("Jean");
        commissioner.setLastName("Commissaire");
        return new UsernamePasswordAuthenticationToken(
                commissioner, null,
                List.of(new SimpleGrantedAuthority("ROLE_COMMISSIONNER")));
    }

    private static ResultResponse athleteResult(Long id, int rank, String performance, boolean tie) {
        return ResultResponse.builder()
                .id(id)
                .trialId(7L)
                .rank(rank)
                .tie(tie)
                .performanceType("TIME")
                .performance(performance)
                .participant(TrialParticipantResponse.builder()
                        .id(id)
                        .trialId(7L)
                        .competitorId(100L + id)
                        .competitorType(CompetitorType.ATHLETE)
                        .displayName("Athlete " + id)
                        .members(null)
                        .build())
                .build();
    }

    private static ResultResponse teamResult(Long id, int rank, String performance) {
        return ResultResponse.builder()
                .id(id)
                .trialId(8L)
                .rank(rank)
                .tie(false)
                .performanceType("POINTS")
                .performance(performance)
                .participant(TrialParticipantResponse.builder()
                        .id(id)
                        .trialId(8L)
                        .competitorId(200L + id)
                        .competitorType(CompetitorType.TEAM)
                        .displayName("Team " + id)
                        .members(List.of(
                                new com.ciblorgasport.trial.dto.AthleteSummary(1L, "Alice", "Martin"),
                                new com.ciblorgasport.trial.dto.AthleteSummary(2L, "Bob", "Dupont")
                        ))
                        .build())
                .build();
    }
}
