package com.ciblorgasport.competition.api;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import org.springframework.http.MediaType;

import java.util.List;
import com.ciblorgasport.competition.dto.AthleteCompetitionDetailsResponse;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.TrialResponse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.competition.application.ParticipationService;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
class AthleteParticipationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ParticipationService participationService;

    @MockBean
    private TrialService trialService;


    @Test
    @DisplayName("Doit retourner 403 Forbidden si l'athlète essaie de voir ses trials alors qu'il n'est pas CONFIRMED")
    void getMyTrials_WhenNotConfirmed_ShouldReturnForbidden() throws Exception {
        com.ciblorgasport.athlete.domain.Athlete athlete = new com.ciblorgasport.athlete.domain.Athlete();
        athlete.setId(10L);
        athlete.setEmail("athlete@test.com");
        athlete.setPassword("pass");

        when(participationService.isConfirmed(10L, 10L)).thenReturn(false);

        mockMvc.perform(get("/api/athlete/competitions/10/trials")
               .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(athlete)))
               .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Doit retourner 200 et les essais pour un athlète CONFIRMED")
    void getMyTrials_WhenConfirmed_ShouldReturnOk() throws Exception {
        com.ciblorgasport.athlete.domain.Athlete athlete = new com.ciblorgasport.athlete.domain.Athlete();
        athlete.setId(10L);
        athlete.setEmail("athlete@test.com");

        when(participationService.isConfirmed(10L, 10L)).thenReturn(true);
        when(trialService.getTrialsForAthlete(10L, 10L)).thenReturn(List.of());

        mockMvc.perform(get("/api/athlete/competitions/10/trials")
               .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(athlete)))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Doit retourner la liste des dashboard cards")
    void getMyCards_ShouldReturnOk() throws Exception {
        com.ciblorgasport.athlete.domain.Athlete athlete = new com.ciblorgasport.athlete.domain.Athlete();
        athlete.setId(10L);
        athlete.setEmail("athlete@test.com");

        when(participationService.getAthleteDashboardCards(10L)).thenReturn(List.of());

        mockMvc.perform(get("/api/athlete/competitions")
               .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(athlete)))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Doit appeler le service pour confirmer la participation")
    void confirmParticipation_ShouldReturnOk() throws Exception {
        com.ciblorgasport.athlete.domain.Athlete athlete = new com.ciblorgasport.athlete.domain.Athlete();
        athlete.setId(10L);
        athlete.setEmail("athlete@test.com");

        mockMvc.perform(post("/api/athlete/competitions/55/confirm")
               .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(athlete)))
               .andExpect(status().isOk());
               
        verify(participationService).confirmParticipation(55L, 10L);
    }
}
