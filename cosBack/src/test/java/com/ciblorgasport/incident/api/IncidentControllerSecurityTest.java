package com.ciblorgasport.incident.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ciblorgasport.admin.Admin;
import com.ciblorgasport.spectator.Spectator;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class IncidentControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountRepository userRepo;

    @Test
    void admin_can_create_incident() throws Exception {
        Admin admin = Admin.builder()
                .firstName("Root")
                .lastName("Admin")
                .email("admin_test@cos.com")
                .password("x")
                .build();
        admin = (Admin) userRepo.save(admin);

        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());

        String body = """
                {
                  "title": "Test Incident",
                  "description": "From JUnit",
                  "impactLevel": "TOUS",
                  "competitionId": null
                }
                """;

        mockMvc.perform(post("/api/incidents")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    void non_admin_cannot_create_incident() throws Exception {
        Spectator spectator = Spectator.builder()
                .firstName("S")
                .lastName("P")
                .email("spec_test@cos.com")
                .password("x")
                .build();
        spectator = (Spectator) userRepo.save(spectator);

        var auth = new UsernamePasswordAuthenticationToken(spectator, null, spectator.getAuthorities());

        String body = """
                {
                  "title": "Should Fail",
                  "description": "From JUnit",
                  "impactLevel": "TOUS",
                  "competitionId": null
                }
                """;

        mockMvc.perform(post("/api/incidents")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }
}