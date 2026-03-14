package com.ciblorgasport.incident.api;

import java.time.LocalDateTime;

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
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.admin.Admin;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.spectator.Spectator;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class IncidentControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountRepository userRepo;

    @Autowired
    private EventRepository eventRepo;

    private Event createEvent() {
        Event event = new Event();
        event.setName("Event test");
        event.setDescription("desc");
        event.setStartDate(LocalDateTime.now().plusDays(1));
        event.setEndDate(LocalDateTime.now().plusDays(2));
        return eventRepo.save(event);
    }

    @Test
    void admin_can_create_incident() throws Exception {
        Admin admin = Admin.builder()
                .firstName("Root")
                .lastName("Admin")
                .email("admin_test@cos.com")
                .password("x")
                .build();
        admin = (Admin) userRepo.save(admin);

        Event event = createEvent();

        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());

        String body = """
                {
                  "title": "Test Incident",
                  "description": "From JUnit",
                  "impactLevels": ["TOUS"],
                  "eventId": %d,
                  "competitionId": null,
                  "siteId": null,
                  "trialId": null
                }
                """.formatted(event.getId());

        mockMvc.perform(post("/api/incidents")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is2xxSuccessful());
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

        Event event = createEvent();

        var auth = new UsernamePasswordAuthenticationToken(spectator, null, spectator.getAuthorities());

        String body = """
                {
                  "title": "Should Fail",
                  "description": "Non admin create",
                  "impactLevels": ["TOUS"],
                  "eventId": %d,
                  "competitionId": null,
                  "siteId": null,
                  "trialId": null
                }
                """.formatted(event.getId());

        mockMvc.perform(post("/api/incidents")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }
}