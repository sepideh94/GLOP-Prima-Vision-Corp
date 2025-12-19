package com.ciblorgasport.competition.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

@SpringBootTest
@AutoConfigureMockMvc
class CompetitionControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private CompetitionRepository competitionRepository;

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
    
   

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCompetition_AsAdmin_WithValidData_ShouldReturnCreated() throws Exception {

    	Event event = new Event();
        event.setName("JO 2025");
        event.setStartDate(LocalDateTime.of(2025, 1, 1, 0, 0));
        event.setEndDate(LocalDateTime.of(2025, 12, 31, 23, 59));
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
    
    @Test
    @WithMockUser(roles = "ADMIN")
    @Transactional
    void updateCompetition_AsAdmin_WithValidData_ShouldReturnOk() throws Exception {
        Event event = new Event();
        event.setName("Événement Test");
        event.setStartDate(LocalDateTime.now().plusDays(1)); 
        event.setEndDate(LocalDateTime.now().plusMonths(1)); 
        event = eventRepository.save(event);

        Competition competition = new Competition();
        competition.setName("Ancien Nom");
        competition.setStartDate(LocalDateTime.now().plusDays(2));
        competition.setEndDate(LocalDateTime.now().plusDays(3));
        competition.setParentEvent(event);
        competition = competitionRepository.save(competition);

        String newStartDate = LocalDateTime.now().plusDays(5).toString();
        String newEndDate = LocalDateTime.now().plusDays(6).toString();

        String updateJson = String.format("""
            {
                "name": "Nom Mis à Jour",
                "description": "Nouvelle description",
                "startDate": "%s",
                "endDate": "%s"
            }
            """, newStartDate, newEndDate);

        mockMvc.perform(put("/api/admin/competitions/" + competition.getId())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk());

        Competition updated = competitionRepository.findById(competition.getId()).get();
        assertEquals("Nom Mis à Jour", updated.getName());
    }

    @Test
    @WithMockUser(roles = "SPECTATOR")
    void updateCompetition_AsSpectator_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(put("/api/admin/competitions/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden()); 
    }
}