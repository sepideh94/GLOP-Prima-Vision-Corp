package com.ciblorgasport.competition.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CompetitionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "SPECTATOR")
    void createCompetition_AsSpectator_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/admin/competitions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\"}"))
                .andExpect(status().isForbidden()); 
    }

    @Test
    void createCompetition_AsAnonymous_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(post("/api/admin/competitions"))
                .andExpect(status().isForbidden()); 
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void createCompetition_AsAdmin_WithMissingData_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/admin/competitions")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\"}")) 
                .andExpect(status().isInternalServerError()); 
    }
    
    @Autowired
    private com.ciblorgasport.event.infrastructure.EventRepository eventRepository;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCompetition_AsAdmin_WithValidData_ShouldReturnCreated() throws Exception {

    	com.ciblorgasport.event.domain.Event event = new com.ciblorgasport.event.domain.Event();
        event.setName("JO 2025");
        event.setStartDate(java.time.LocalDateTime.of(2025, 1, 1, 0, 0));
        event.setEndDate(java.time.LocalDateTime.of(2025, 12, 31, 23, 59));
        event = eventRepository.save(event); 

        String competitionJson = String.format("""
            {
                "name": "Tournoi de Judo",
                "description": "Compétition de judo junior",
                "startDate": "2025-08-01T10:00:00",
                "endDate": "2025-08-05T18:00:00",
                "parentEventId": %d
            }
            """, event.getId());

        mockMvc.perform(post("/api/admin/competitions")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(competitionJson))
                .andExpect(status().isCreated());
    }
}