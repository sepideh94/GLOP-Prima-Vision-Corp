package com.ciblorgasport.incident.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.spectator.Spectator;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class IncidentVisibilityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountRepository userRepo;

    @Autowired
    private IncidentRepository incidentRepo;

    @Autowired
    private EventRepository eventRepo;

    private Event createEvent() {
        Event event = new Event();
        event.setName("Event visibility test");
        event.setDescription("desc");
        event.setStartDate(LocalDateTime.now().plusDays(1));
        event.setEndDate(LocalDateTime.now().plusDays(2));
        return eventRepo.save(event);
    }

    private void seedImpacts(UserAccount createdBy, Event event) {
        incidentRepo.save(Incident.builder()
                .title("I_TOUS")
                .description("tous")
                .impactLevel(ImpactLevel.TOUS)
                .status(IncidentStatus.EN_COURS)
                .event(event)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I_COMMISSIONNER")
                .description("commissionner only")
                .impactLevel(ImpactLevel.COMMISSIONNER)
                .status(IncidentStatus.EN_COURS)
                .event(event)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I_ATHLETE")
                .description("athlete only")
                .impactLevel(ImpactLevel.ATHLETE)
                .status(IncidentStatus.EN_COURS)
                .event(event)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I_SPECTATOR")
                .description("spectator only")
                .impactLevel(ImpactLevel.SPECTATOR)
                .status(IncidentStatus.EN_COURS)
                .event(event)
                .createdBy(createdBy)
                .build());
    }

    @Test
    void commissionner_sees_tous_and_commissionner_only() throws Exception {
        Commissionner commissionner = Commissionner.builder()
                .firstName("C")
                .lastName("M")
                .email("commissionner_vis_test@cos.com")
                .password("x")
                .build();
        commissionner = (Commissionner) userRepo.save(commissionner);

        Event event = createEvent();
        seedImpacts(commissionner, event);

        var auth = new UsernamePasswordAuthenticationToken(commissionner, null, commissionner.getAuthorities());

        mockMvc.perform(get("/api/incidents")
                        .queryParam("eventId", String.valueOf(event.getId()))
                        .with(authentication(auth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.impactLevel=='TOUS')]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='COMMISSIONNER')]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='ATHLETE')]").isEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='SPECTATOR')]").isEmpty());
    }

    @Test
    void spectator_sees_tous_and_spectator_only() throws Exception {
        Spectator spectator = Spectator.builder()
                .firstName("S")
                .lastName("P")
                .email("spectator_vis_test@cos.com")
                .password("x")
                .build();
        spectator = (Spectator) userRepo.save(spectator);

        Event event = createEvent();
        seedImpacts(spectator, event);

        var auth = new UsernamePasswordAuthenticationToken(spectator, null, spectator.getAuthorities());

        mockMvc.perform(get("/api/incidents")
                        .queryParam("eventId", String.valueOf(event.getId()))
                        .with(authentication(auth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.impactLevel=='TOUS')]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='SPECTATOR')]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='ATHLETE')]").isEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='COMMISSIONNER')]").isEmpty());
    }
}