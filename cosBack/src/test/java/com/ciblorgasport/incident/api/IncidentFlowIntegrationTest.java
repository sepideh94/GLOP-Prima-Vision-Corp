package com.ciblorgasport.incident.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.admin.domain.Admin;
import com.ciblorgasport.analytics.application.AnalyticsService;
import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.notification.application.IncidentNotificationService;
import com.ciblorgasport.spectator.domain.Spectator;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class IncidentFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserAccountRepository userRepo;
    @Autowired
    private EventRepository eventRepo;
    @Autowired
    private IncidentRepository incidentRepo;

    @MockBean
    private IncidentNotificationService incidentNotificationService;
    @MockBean
    private AnalyticsService analyticsService;

    @Test
    void createIncident_shouldTriggerNotificationAndRespectRoleVisibility() throws Exception {
        Admin admin = Admin.builder()
                .firstName("Root")
                .lastName("Admin")
                .email("admin_flow@cos.com")
                .password("x")
                .build();
        admin = (Admin) userRepo.save(admin);

        Commissionner commissionner = Commissionner.builder()
                .firstName("Com")
                .lastName("Mis")
                .email("comm_flow@cos.com")
                .password("x")
                .build();
        commissionner = (Commissionner) userRepo.save(commissionner);

        Spectator spectator = Spectator.builder()
                .firstName("Spec")
                .lastName("Ta")
                .email("spectator_flow@cos.com")
                .password("x")
                .build();
        spectator = (Spectator) userRepo.save(spectator);

        Event event = new Event();
        event.setName("Incident flow event");
        event.setDescription("desc");
        event.setStartDate(LocalDateTime.now().plusDays(1));
        event.setEndDate(LocalDateTime.now().plusDays(2));
        event = eventRepo.save(event);

        String body = """
                {
                  "title": "Incident ciblé commissaires",
                  "description": "Test flow",
                  "impactLevels": ["COMMISSIONNER"],
                  "eventId": %d,
                  "competitionId": null,
                  "siteId": null,
                  "trialId": null
                }
                """.formatted(event.getId());

        var adminAuth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        mockMvc.perform(post("/api/incidents")
                        .with(authentication(adminAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is2xxSuccessful());

        verify(incidentNotificationService).notifyIncidentCreated(any());
        verify(analyticsService).logAction(any(), any(), any());

        org.assertj.core.api.Assertions.assertThat(incidentRepo.findByEvent_Id(event.getId())).hasSize(1);

        var commissionerAuth = new UsernamePasswordAuthenticationToken(commissionner, null, commissionner.getAuthorities());
        mockMvc.perform(get("/api/incidents")
                        .queryParam("eventId", String.valueOf(event.getId()))
                        .with(authentication(commissionerAuth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Incident ciblé commissaires"));

        var spectatorAuth = new UsernamePasswordAuthenticationToken(spectator, null, spectator.getAuthorities());
        mockMvc.perform(get("/api/incidents")
                        .queryParam("eventId", String.valueOf(event.getId()))
                        .with(authentication(spectatorAuth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void resolveIncident_shouldUpdateStatusAndTriggerResolvedNotification() throws Exception {
        Admin admin = Admin.builder()
                .firstName("Root")
                .lastName("Admin")
                .email("admin_resolve@cos.com")
                .password("x")
                .build();
        admin = (Admin) userRepo.save(admin);

        Event event = new Event();
        event.setName("Incident resolve event");
        event.setDescription("desc");
        event.setStartDate(LocalDateTime.now().plusDays(1));
        event.setEndDate(LocalDateTime.now().plusDays(2));
        event = eventRepo.save(event);

        String createBody = """
                {
                  "title": "Incident à résoudre",
                  "description": "Test resolve",
                  "impactLevels": ["TOUS"],
                  "eventId": %d,
                  "competitionId": null,
                  "siteId": null,
                  "trialId": null
                }
                """.formatted(event.getId());

        var adminAuth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        mockMvc.perform(post("/api/incidents")
                        .with(authentication(adminAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().is2xxSuccessful());

        Long incidentId = incidentRepo.findByEvent_Id(event.getId()).stream()
                .findFirst()
                .orElseThrow()
                .getId();

        String statusBody = """
                {
                  "status": "RESOLU"
                }
                """;

        mockMvc.perform(patch("/api/incidents/" + incidentId + "/status")
                        .with(authentication(adminAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(incidentId))
                .andExpect(jsonPath("$.status").value("RESOLU"));

        com.ciblorgasport.incident.domain.Incident updated = incidentRepo.findById(incidentId).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(updated.getStatus())
                .isEqualTo(com.ciblorgasport.incident.domain.IncidentStatus.RESOLU);

        verify(incidentNotificationService).notifyIncidentResolved(any());
    }
}
