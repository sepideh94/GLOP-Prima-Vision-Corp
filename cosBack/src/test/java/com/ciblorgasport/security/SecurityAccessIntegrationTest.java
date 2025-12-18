package com.ciblorgasport.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicRoute_EventsGet_ShouldBeAccessibleByAll() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk()); 
    }

    @Test
    @WithMockUser(roles = "SPECTATOR")
    void protectedRoute_Admin_ShouldBeForbiddenForSpectator() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden()); 
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void protectedRoute_Admin_ShouldBeAllowedForAdmin() throws Exception {
        mockMvc.perform(post("/api/admin/create-commissaire")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@test.com\", \"password\":\"pass123\"}")) 
                .andExpect(status().isCreated()); 
    }

    @Test
    @WithMockUser(roles = "SPECTATOR")
    void createEvent_ShouldBeForbiddenForSpectator() throws Exception {
        mockMvc.perform(post("/api/events"))
                .andExpect(status().isForbidden()); 
    }
}