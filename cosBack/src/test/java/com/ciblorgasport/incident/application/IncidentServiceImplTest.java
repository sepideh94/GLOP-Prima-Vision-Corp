package com.ciblorgasport.incident.application;

import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.incident.dto.IncidentCreateRequest;
import com.ciblorgasport.incident.dto.IncidentResponse;
import com.ciblorgasport.incident.dto.IncidentUpdateRequest;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.notification.application.IncidentNotificationService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.user.domain.UserAccount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceImplTest {

    @Mock
    private IncidentRepository incidentRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private CompetitionRepository competitionRepository;
    @Mock
    private SiteRepository siteRepository;
    @Mock
    private TrialRepository trialRepository;
    @Mock
    private IncidentNotificationService incidentNotificationService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private IncidentServiceImpl incidentService;

    private UserAccount adminUser;
    private UserAccount normalUser;

    @BeforeEach
    void setUp() {
        adminUser = mock(UserAccount.class);
        lenient().when(adminUser.isAdmin()).thenReturn(true);
        lenient().when(adminUser.getId()).thenReturn(1L);

        normalUser = mock(UserAccount.class);
        lenient().when(normalUser.isAdmin()).thenReturn(false);
        lenient().when(normalUser.isAthlete()).thenReturn(true);
    }

    @Nested
    @DisplayName("Create Method Tests")
    class CreateTests {
        @Test
        @DisplayName("Should create incident successfully")
        void shouldCreateIncident() {
            IncidentCreateRequest req = new IncidentCreateRequest();
            req.setTitle("Test Incident");
            req.setDescription("Desc");
            req.setEventId(10L);
            req.setImpactLevels(Set.of(ImpactLevel.ATHLETE));

            Event event = new Event();
            event.setId(10L);
            when(eventRepository.findById(10L)).thenReturn(Optional.of(event));

            Incident saved = Incident.builder().id(100L).title("Test Incident").build();
            when(incidentRepository.saveAndFlush(any(Incident.class))).thenReturn(saved);

            IncidentResponse response = incidentService.create(adminUser, req);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(100L);
            verify(incidentNotificationService).notifyIncidentCreated(saved);
        }

        @Test
        @DisplayName("Should throw if user is not admin")
        void shouldThrowNotAdmin() {
            IncidentCreateRequest req = new IncidentCreateRequest();
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, 
                () -> incidentService.create(normalUser, req));
            
            assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should throw if TOUS is combined with others")
        void shouldThrowTousCombined() {
            IncidentCreateRequest req = new IncidentCreateRequest();
            req.setEventId(10L);
            req.setImpactLevels(Set.of(ImpactLevel.TOUS, ImpactLevel.ATHLETE));

            Event event = new Event();
            event.setId(10L);
            when(eventRepository.findById(10L)).thenReturn(Optional.of(event));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, 
                () -> incidentService.create(adminUser, req));
            
            assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should throw if competition is completed")
        void shouldThrowCompetitionCompleted() {
            IncidentCreateRequest req = new IncidentCreateRequest();
            req.setEventId(10L);
            req.setCompetitionId(20L);
            req.setImpactLevels(Set.of(ImpactLevel.ATHLETE));

            Event event = new Event();
            event.setId(10L);
            when(eventRepository.findById(10L)).thenReturn(Optional.of(event));

            Competition comp = mock(Competition.class);
            lenient().when(comp.getId()).thenReturn(20L);
            when(comp.getStatus()).thenReturn(Status.COMPLETED);
            when(competitionRepository.findById(20L)).thenReturn(Optional.of(comp));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, 
                () -> incidentService.create(adminUser, req));
            
            assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("Update Method Tests")
    class UpdateTests {
        @Test
        @DisplayName("Should update incident successfully")
        void shouldUpdateIncident() {
            IncidentUpdateRequest req = new IncidentUpdateRequest();
            req.setTitle("Updated Title");
            req.setEventId(10L);
            req.setImpactLevels(Set.of(ImpactLevel.SPECTATOR));

            Incident existing = new Incident();
            existing.setId(1L);
            when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));

            Event event = new Event();
            event.setId(10L);
            when(eventRepository.findById(10L)).thenReturn(Optional.of(event));

            when(incidentRepository.saveAndFlush(any(Incident.class))).thenReturn(existing);

            IncidentResponse response = incidentService.update(adminUser, 1L, req);

            assertThat(response).isNotNull();
            verify(incidentNotificationService).notifyIncidentUpdated(existing);
        }

        @Test
        @DisplayName("Should throw if incident not found")
        void shouldThrowNotFound() {
            IncidentUpdateRequest req = new IncidentUpdateRequest();
            when(incidentRepository.findById(1L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, 
                () -> incidentService.update(adminUser, 1L, req));
            
            assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("ChangeStatus Method Tests")
    class ChangeStatusTests {
        @Test
        @DisplayName("Should change status and notify if RESOLU")
        void shouldChangeStatusToResolu() {
            Incident existing = new Incident();
            existing.setId(1L);
            when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(incidentRepository.saveAndFlush(any(Incident.class))).thenReturn(existing);

            incidentService.changeStatus(adminUser, 1L, IncidentStatus.RESOLU);

            assertThat(existing.getStatus()).isEqualTo(IncidentStatus.RESOLU);
            verify(incidentNotificationService).notifyIncidentResolved(existing);
        }
    }

    @Nested
    @DisplayName("Delete Method Tests")
    class DeleteTests {
        @Test
        @DisplayName("Should delete incident and notifications")
        void shouldDelete() {
            when(incidentRepository.existsById(1L)).thenReturn(true);

            incidentService.delete(adminUser, 1L);

            verify(notificationService).deleteByIncidentId(1L);
            verify(incidentRepository).deleteById(1L);
        }
    }

    @Nested
    @DisplayName("GetById and List Method Tests")
    class ReadTests {
        @Test
        @DisplayName("Admin should get incident bypass impact rules")
        void adminShouldGetIncident() {
            Incident existing = new Incident();
            existing.setId(1L);
            existing.setImpactLevels(Set.of(ImpactLevel.VOLONTEER));
            when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));

            IncidentResponse response = incidentService.getById(adminUser, 1L);
            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Athlete should get incident if ATHLETE impact")
        void athleteShouldGetIncident() {
            Incident existing = new Incident();
            existing.setId(1L);
            existing.setImpactLevels(Set.of(ImpactLevel.ATHLETE));
            when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));

            IncidentResponse response = incidentService.getById(normalUser, 1L);
            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Athlete should be forbidden if only VOLONTEER impact")
        void athleteShouldBeForbidden() {
            Incident existing = new Incident();
            existing.setId(1L);
            existing.setImpactLevels(Set.of(ImpactLevel.VOLONTEER));
            when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, 
                () -> incidentService.getById(normalUser, 1L));
            assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should list incidents filtering properly")
        void shouldListIncidents() {
            Incident existing = new Incident();
            existing.setId(1L);
            existing.setImpactLevels(Set.of(ImpactLevel.ATHLETE));
            
            when(incidentRepository.findByEvent_Id(10L)).thenReturn(List.of(existing));

            List<IncidentResponse> results = incidentService.list(normalUser, 10L, Set.of(ImpactLevel.ATHLETE), null, null, null);
            assertThat(results).hasSize(1);
        }
    }
}
