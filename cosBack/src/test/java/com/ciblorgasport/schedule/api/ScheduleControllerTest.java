package com.ciblorgasport.schedule.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.competition.application.ParticipationService;
import com.ciblorgasport.schedule.application.ScheduleService;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ParticipationService participationService;

    @MockBean
    private ScheduleService scheduleService;

    @Test
    @DisplayName("Doit retourner 403 Forbidden avec message si la participation n'est pas CONFIRMED")
    void getAthleteSchedule_WhenNotConfirmed_ShouldReturnForbiddenWithMessage() throws Exception {
        com.ciblorgasport.athlete.domain.Athlete athlete = new com.ciblorgasport.athlete.domain.Athlete();
        athlete.setId(10L);
        athlete.setEmail("athlete@test.com");
        athlete.setPassword("pass");

        when(participationService.isConfirmed(10L, 10L)).thenReturn(false);

        mockMvc.perform(get("/api/schedule/athlete/competition/10")
               .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(athlete)))
               .andExpect(status().isForbidden())
               .andExpect(jsonPath("$.message").value("Votre participation est en attente de validation par le commissaire. Vous ne pouvez pas encore consulter votre planning."));
    }
}
