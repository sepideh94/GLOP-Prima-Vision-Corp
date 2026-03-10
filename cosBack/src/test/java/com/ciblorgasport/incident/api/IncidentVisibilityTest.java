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

    private void seedImpacts(UserAccount createdBy) {
        incidentRepo.save(Incident.builder()
                .title("I_TOUS")
                .description("tous")
                .impactLevel(ImpactLevel.TOUS)
                .status(IncidentStatus.EN_COURS)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I_COMMISSIONNER")
                .description("commissionner only")
                .impactLevel(ImpactLevel.COMMISSIONNER)
                .status(IncidentStatus.EN_COURS)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I_ATHLETE")
                .description("athlete only")
                .impactLevel(ImpactLevel.ATHLETE)
                .status(IncidentStatus.EN_COURS)
                .createdBy(createdBy)
                .build());

        incidentRepo.save(Incident.builder()
                .title("I_SPECTATOR")
                .description("spectator only")
                .impactLevel(ImpactLevel.SPECTATOR)
                .status(IncidentStatus.EN_COURS)
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

        seedImpacts(commissionner);

        var auth = new UsernamePasswordAuthenticationToken(commissionner, null, commissionner.getAuthorities());

        mockMvc.perform(get("/api/incidents")
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

        seedImpacts(spectator);

        var auth = new UsernamePasswordAuthenticationToken(spectator, null, spectator.getAuthorities());

        mockMvc.perform(get("/api/incidents")
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