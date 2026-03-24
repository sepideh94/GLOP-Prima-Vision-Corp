package com.ciblorgasport.athlete.api;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.trial.application.TrialResultService;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.user.application.UserAccountService;
import org.springframework.test.context.ActiveProfiles;

@WebMvcTest(AthleteResultsController.class)
@ActiveProfiles("test")
@Import(SecurityDisabledConfig.class)
@DisplayName("AthleteResultsController")
class AthleteResultsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TrialResultService trialResultService;
    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private UserAccountService userAccountService;

    private static Athlete athleteUser(long id) {
        return Athlete.builder()
                .id(id)
                .email("athlete" + id + "@test.com")
                .password("secret")
                .firstName("Jean")
                .lastName("Test")
                .isActive(true)
                .build();
    }

    @Nested
    @DisplayName("GET /api/athlete/results/competitors")
    class GetCompetitorResults {

        @Test
        @DisplayName("200 — délègue à getCompetitorResultsByAthleteId et sérialise la réponse")
        void returns200WithResults() throws Exception {
            long userId = 42L;
            List<ResultResponse> results = List.of(
                    ResultResponse.builder()
                            .id(1L)
                            .trialId(7L)
                            .rank(2)
                            .tie(false)
                            .performanceType("TIME")
                            .performance("10.05s")
                            .participant(TrialParticipantResponse.builder()
                                    .id(99L)
                                    .trialId(7L)
                                    .competitorId(200L)
                                    .competitorType(CompetitorType.ATHLETE)
                                    .displayName("Concurrent")
                                    .build())
                            .build()
            );
            given(trialResultService.getCompetitorResultsByAthleteId(userId)).willReturn(results);

            mockMvc.perform(get("/api/athlete/results/competitors").with(user(athleteUser(userId))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].rank").value(2))
                    .andExpect(jsonPath("$[0].performance").value("10.05s"))
                    .andExpect(jsonPath("$[0].participant.displayName").value("Concurrent"));

            verify(trialResultService).getCompetitorResultsByAthleteId(userId);
        }

        @Test
        @DisplayName("200 — liste vide")
        void returns200WhenEmpty() throws Exception {
            given(trialResultService.getCompetitorResultsByAthleteId(5L)).willReturn(List.of());

            mockMvc.perform(get("/api/athlete/results/competitors").with(user(athleteUser(5L))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/athlete/results")
    class GetMyResults {

        @Test
        @DisplayName("200 — délègue à getResultsByAthleteId")
        void returns200() throws Exception {
            given(trialResultService.getResultsByAthleteId(8L)).willReturn(List.of());

            mockMvc.perform(get("/api/athlete/results").with(user(athleteUser(8L))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));

            verify(trialResultService).getResultsByAthleteId(8L);
        }
    }
}
