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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.spectator.Spectator;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.transaction.Transactional;

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

    private void seedThreeImpacts(UserAccount createdBy) {
        incidentRepo.save(Incident.builder()
                .title("I1")
                .description("only commissionners")
                .impactLevel(ImpactLevel.COMMISSIONNERS)
                .status(IncidentStatus.OUVERT)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I2")
                .description("commissionners + athletes")
                .impactLevel(ImpactLevel.COMMISSIONNERS_ATHLETES)
                .status(IncidentStatus.OUVERT)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I3")
                .description("tous")
                .impactLevel(ImpactLevel.TOUS)
                .status(IncidentStatus.OUVERT)
                .createdBy(createdBy)
                .build());
    }

    @Test
    void athlete_sees_only_commissionners_athletes_and_tous() throws Exception {
        Athlete athlete = Athlete.builder()
                .firstName("A")
                .lastName("T")
                .email("athlete_vis_test@cos.com")
                .password("x")
                .build();
        athlete = (Athlete) userRepo.save(athlete);

        seedThreeImpacts(athlete);

        var auth = new UsernamePasswordAuthenticationToken(athlete, null, athlete.getAuthorities());

        mockMvc.perform(get("/api/incidents")
                        .with(authentication(auth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.impactLevel=='COMMISSIONNERS')]").isEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='COMMISSIONNERS_ATHLETES')]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='TOUS')]").isNotEmpty());
    }

    @Test
    void commissionner_sees_all_impacts() throws Exception {
        Commissionner commissionner = Commissionner.builder()
                .firstName("C")
                .lastName("M")
                .email("commissionner_vis_test@cos.com")
                .password("x")
                .build();
        commissionner = (Commissionner) userRepo.save(commissionner);

        seedThreeImpacts(commissionner);

        var auth = new UsernamePasswordAuthenticationToken(commissionner, null, commissionner.getAuthorities());

        mockMvc.perform(get("/api/incidents")
                        .with(authentication(auth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[?(@.impactLevel=='COMMISSIONNERS')]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='COMMISSIONNERS_ATHLETES')]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.impactLevel=='TOUS')]").isNotEmpty());
    }

    @Test
    void spectator_sees_only_tous() throws Exception {
        Spectator spectator = Spectator.builder()
                .firstName("S")
                .lastName("P")
                .email("spectator_vis_test@cos.com")
                .password("x")
                .build();
        spectator = (Spectator) userRepo.save(spectator);

        seedThreeImpacts(spectator);

        var auth = new UsernamePasswordAuthenticationToken(spectator, null, spectator.getAuthorities());

        mockMvc.perform(get("/api/incidents")
                        .with(authentication(auth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].impactLevel").value("TOUS"));
    }
}