package com.ciblorgasport.incident.application;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.incident.dto.IncidentCreateRequest;
import com.ciblorgasport.incident.dto.IncidentResponse;
import com.ciblorgasport.incident.dto.IncidentUpdateRequest;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.user.domain.UserAccount;

@SpringBootTest
@Transactional
class IncidentServiceIT {

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private EventRepository eventRepository;

    private UserAccount adminActor;
    private Event testEvent;

    /**
     * Classe interne pour simuler un administrateur car Athlete.isAdmin() est false.
     * Si vous avez une entité Admin.java, utilisez-la à la place de cette astuce.
     */
    private static class AdminUser extends Athlete {
        @Override
        public boolean isAdmin() {
            return true;
        }
    }

    @BeforeEach
    void setUp() {
        // Création d'un compte avec les privilèges admin pour passer assertAdmin()
        // On utilise une instance anonyme ou surchargée si nécessaire
        Athlete admin = new Athlete() {
            @Override
            public boolean isAdmin() {
                return true;
            }
        };
        admin.setFirstName("Admin");
        admin.setLastName("System");
        admin.setEmail("admin.test." + System.currentTimeMillis() + "@test.com");
        admin.setPassword("password");
        admin.setActive(true);
        
        // On sauvegarde l'admin. Note: si le repository rejette l'anonyme, 
        // utilisez une entité Admin réelle si elle existe dans votre projet.
        adminActor = athleteRepository.save(admin);

        testEvent = new Event();
        testEvent.setName("JO 2024");
        testEvent.setStartDate(LocalDateTime.now());
        testEvent.setEndDate(LocalDateTime.now().plusDays(15));
        testEvent = eventRepository.save(testEvent);
    }

    @Test
    void shouldCreateIncidentSuccessfully() {
        IncidentCreateRequest request = new IncidentCreateRequest();
        request.setTitle("Panne de chronomètre");
        request.setDescription("Le chrono de la piste 1 est HS");
        request.setEventId(testEvent.getId());
        request.setImpactLevels(new HashSet<>(Set.of(ImpactLevel.TOUS)));

        IncidentResponse response = incidentService.create(adminActor, request);

        assertThat(response.getId()).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Panne de chronomètre");
    }

    @Test
    void shouldUpdateIncidentSuccessfully() {
        Incident incident = createTestIncident("Titre Initial");

        IncidentUpdateRequest updateReq = new IncidentUpdateRequest();
        updateReq.setTitle("Titre Modifié");
        updateReq.setDescription("Description modifiée");
        updateReq.setEventId(testEvent.getId());
        updateReq.setImpactLevels(new HashSet<>(Set.of(ImpactLevel.TOUS)));

        IncidentResponse response = incidentService.update(adminActor, incident.getId(), updateReq);

        assertThat(response.getTitle()).isEqualTo("Titre Modifié");
    }

    @Test
    void shouldChangeStatusToResolved() {
        Incident incident = createTestIncident("Incident à résoudre");

        IncidentResponse response = incidentService.changeStatus(adminActor, incident.getId(), IncidentStatus.RESOLU);

        assertThat(response.getStatus()).isEqualTo(IncidentStatus.RESOLU);
    }

    @Test
    void shouldGetIncidentById() {
        Incident incident = createTestIncident("Incident Visibilité");

        // getById ne demande pas forcément isAdmin() mais canView()
        IncidentResponse response = incidentService.getById(adminActor, incident.getId());

        assertThat(response.getId()).isEqualTo(incident.getId());
    }

    @Test
    void shouldDeleteIncident() {
        Incident incident = createTestIncident("A supprimer");

        incidentService.delete(adminActor, incident.getId());

        assertThat(incidentRepository.findById(incident.getId())).isEmpty();
    }

    private Incident createTestIncident(String title) {
        Incident incident = Incident.builder()
                .title(title)
                .description("Test Description")
                .event(testEvent)
                .impactLevels(new HashSet<>(Set.of(ImpactLevel.TOUS)))
                .status(IncidentStatus.EN_COURS)
                .createdBy(adminActor)
                .build();
        return incidentRepository.saveAndFlush(incident);
    }
}