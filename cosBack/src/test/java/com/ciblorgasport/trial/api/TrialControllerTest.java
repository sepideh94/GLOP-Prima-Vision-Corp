package com.ciblorgasport.trial.api;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.trial.application.TrialParticipantService;
import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.AthleteSummary;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.user.application.UserAccountService;

@WebMvcTest(TrialController.class)
@Import(SecurityDisabledConfig.class)
@DisplayName("TrialController — résultats & participants")
class TrialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private TrialService trialService;
    @MockitoBean private TrialParticipantService trialParticipantService;
    @MockitoBean private TrialResultService trialResultService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserAccountService userAccountService;

    // =========================================================================
    // GET /api/trials/{id}/results
    // =========================================================================

    @Nested
    @DisplayName("GET /api/trials/{id}/results")
    class GetResults {

        @Test
        @DisplayName("200 — retourne la liste des résultats classés pour athlètes individuels")
        void shouldReturn200WithAthleteResults() throws Exception {
            List<ResultResponse> results = List.of(
                    athleteResult(1L, 1, "10.01s"),
                    athleteResult(2L, 2, "10.05s")
            );
            given(trialResultService.getResultsByTrialId(7L)).willReturn(results);

            mockMvc.perform(get("/api/trials/{id}/results", 7L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].rank").value(1))
                    .andExpect(jsonPath("$[0].tie").value(false))
                    .andExpect(jsonPath("$[0].performanceType").value("TIME"))
                    .andExpect(jsonPath("$[0].performance").value("10.01s"))
                    .andExpect(jsonPath("$[0].participant.competitorType").value("ATHLETE"))
                    .andExpect(jsonPath("$[0].participant.displayName").value("Athlete 1"))
                    .andExpect(jsonPath("$[1].rank").value(2));

            verify(trialResultService).getResultsByTrialId(7L);
        }

        @Test
        @DisplayName("200 — retourne la liste des résultats classés pour équipes")
        void shouldReturn200WithTeamResults() throws Exception {
            List<ResultResponse> results = List.of(
                    teamResult(1L, 1, "9.75 pts"),
                    teamResult(2L, 2, "8.50 pts")
            );
            given(trialResultService.getResultsByTrialId(8L)).willReturn(results);

            mockMvc.perform(get("/api/trials/{id}/results", 8L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].rank").value(1))
                    .andExpect(jsonPath("$[0].performanceType").value("POINTS"))
                    .andExpect(jsonPath("$[0].participant.competitorType").value("TEAM"))
                    .andExpect(jsonPath("$[0].participant.displayName").value("Team 1"))
                    .andExpect(jsonPath("$[0].participant.members.length()").value(2))
                    .andExpect(jsonPath("$[0].participant.members[0].firstName").value("Alice"));

            verify(trialResultService).getResultsByTrialId(8L);
        }

        @Test
        @DisplayName("200 — liste vide si aucun résultat enregistré")
        void shouldReturn200WithEmptyList() throws Exception {
            given(trialResultService.getResultsByTrialId(9L)).willReturn(List.of());

            mockMvc.perform(get("/api/trials/{id}/results", 9L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));

            verify(trialResultService).getResultsByTrialId(9L);
        }

        @Test
        @DisplayName("200 — ex aequo : tie=true sur les participants à égalité")
        void shouldReturnTieFlagOnEqualPerformances() throws Exception {
            ResultResponse tied1 = athleteResult(1L, 1, "10.01s").toBuilder().tie(true).build();
            ResultResponse tied2 = athleteResult(2L, 1, "10.01s").toBuilder().tie(true).build();
            ResultResponse third = athleteResult(3L, 3, "10.05s");

            given(trialResultService.getResultsByTrialId(10L)).willReturn(List.of(tied1, tied2, third));

            mockMvc.perform(get("/api/trials/{id}/results", 10L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3))
                    .andExpect(jsonPath("$[0].rank").value(1))
                    .andExpect(jsonPath("$[0].tie").value(true))
                    .andExpect(jsonPath("$[1].rank").value(1))
                    .andExpect(jsonPath("$[1].tie").value(true))
                    .andExpect(jsonPath("$[2].rank").value(3))
                    .andExpect(jsonPath("$[2].tie").value(false));
        }
    }

    // =========================================================================
    // GET /api/trials/{id}/participants
    // =========================================================================

    @Nested
    @DisplayName("GET /api/trials/{id}/participants")
    class GetParticipants {

        @Test
        @DisplayName("200 — retourne les participants athlètes d'une épreuve")
        void shouldReturn200WithAthleteParticipants() throws Exception {
            List<TrialParticipantResponse> participants = List.of(
                    athleteParticipant(1L),
                    athleteParticipant(2L)
            );
            given(trialParticipantService.getByTrialId(7L)).willReturn(participants);

            mockMvc.perform(get("/api/trials/{id}/participants", 7L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].competitorType").value("ATHLETE"))
                    .andExpect(jsonPath("$[0].displayName").value("Athlete 1"));

            verify(trialParticipantService).getByTrialId(7L);
        }

        @Test
        @DisplayName("200 — retourne les participants équipes avec leurs membres")
        void shouldReturn200WithTeamParticipants() throws Exception {
            List<TrialParticipantResponse> participants = List.of(teamParticipant(1L));
            given(trialParticipantService.getByTrialId(8L)).willReturn(participants);

            mockMvc.perform(get("/api/trials/{id}/participants", 8L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].competitorType").value("TEAM"))
                    .andExpect(jsonPath("$[0].members.length()").value(2));

            verify(trialParticipantService).getByTrialId(8L);
        }

        @Test
        @DisplayName("200 — liste vide si aucun participant assigné")
        void shouldReturn200WithEmptyParticipants() throws Exception {
            given(trialParticipantService.getByTrialId(99L)).willReturn(List.of());

            mockMvc.perform(get("/api/trials/{id}/participants", 99L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    // =========================================================================
    // Builders
    // =========================================================================

    private static ResultResponse athleteResult(Long id, int rank, String performance) {
        return ResultResponse.builder()
                .id(id)
                .trialId(7L)
                .rank(rank)
                .tie(false)
                .performanceType("TIME")
                .performance(performance)
                .participant(athleteParticipant(id))
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
                .participant(teamParticipant(id))
                .build();
    }

    private static TrialParticipantResponse athleteParticipant(Long id) {
        return TrialParticipantResponse.builder()
                .id(id)
                .trialId(7L)
                .competitorId(100L + id)
                .competitorType(CompetitorType.ATHLETE)
                .displayName("Athlete " + id)
                .members(null)
                .build();
    }

    private static TrialParticipantResponse teamParticipant(Long id) {
        return TrialParticipantResponse.builder()
                .id(id)
                .trialId(8L)
                .competitorId(200L + id)
                .competitorType(CompetitorType.TEAM)
                .displayName("Team " + id)
                .members(List.of(
                        new AthleteSummary(1L, "Alice", "Martin"),
                        new AthleteSummary(2L, "Bob", "Dupont")
                ))
                .build();
    }
}
