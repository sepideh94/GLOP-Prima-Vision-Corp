package com.ciblorgasport.competition.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

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
}