package com.ciblorgasport.commissionner.api;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialMode;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;
import com.ciblorgasport.trial.round.infrastructure.RoundRepository;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CommissionnerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private TrialRepository trialRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private RoundRepository roundRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    private Event testEvent;
    private Competition testCompetition;
    private Site testSite;
    private Round testRound;
    private Trial testTrial;
    private Commissionner testCommissioner;

    @BeforeEach
    void setUp() {
        // Créer un commissioner pour les tests d'annulation
        testCommissioner = new Commissionner();
        testCommissioner.setEmail("commissioner@test.com");
        testCommissioner.setFirstName("Test");
        testCommissioner.setLastName("Commissioner");
        testCommissioner.setPassword("password123");
        testCommissioner.setAccredited(true);
        testCommissioner = userAccountRepository.save(testCommissioner);

        // Créer un événement
        testEvent = new Event();
        testEvent.setName("Championnats de France 2025");
        testEvent.setDescription("Championnats nationaux de natation");
        testEvent.setStartDate(LocalDateTime.now().plusDays(10));
        testEvent.setEndDate(LocalDateTime.now().plusDays(20));
        testEvent = eventRepository.save(testEvent);

        // Créer une compétition
        testCompetition = new Competition();
        testCompetition.setName("Natation Senior");
        testCompetition.setDescription("Compétition senior de natation");
        testCompetition.setStartDate(LocalDateTime.now().plusDays(11));
        testCompetition.setEndDate(LocalDateTime.now().plusDays(15));
        testCompetition.setParentEvent(testEvent);
        testCompetition = competitionRepository.save(testCompetition);

        // Créer un site
        testSite = new Site();
        testSite.setAdress("Piscine Olympique, Paris");
        testSite.setLatitude(48.8566);
        testSite.setLongitude(2.3522);
        testSite = siteRepository.save(testSite);

        // Créer un round
        testRound = new Round();
        testRound.setName(RoundName.FINALE);
        testRound = roundRepository.save(testRound);

        // Créer une épreuve
        testTrial = new Trial();
        testTrial.setTrialName(TrialName.HUNDRED_M_FREESTYLE);
        testTrial.setDescription("100m nage libre - Finale");
        testTrial.setRules("Règles FINA");
        testTrial.setStartDate(LocalDate.now().plusDays(12));
        testTrial.setStartHour(LocalTime.of(14, 0));
        testTrial.setEndDate(LocalDate.now().plusDays(12));
        testTrial.setEndHour(LocalTime.of(15, 0));
        testTrial.setMode(TrialMode.INDIVIDUAL);
        testTrial.setCategoryGender(CategoryGender.MALE);
        testTrial.setCompetition(testCompetition);
        testTrial.setSite(testSite);
        testTrial.setRound(testRound);
        testTrial = trialRepository.save(testTrial);
    }

    // ==================== TESTS ACCÈS SÉCURITÉ ====================

    @Nested
    @DisplayName("Tests d'accès sécurité")
    class SecurityAccessTests {

        @Test
        @DisplayName("Accès anonyme aux endpoints commissioner doit retourner 403")
        void anonymousAccess_ShouldReturnForbidden() throws Exception {
            mockMvc.perform(get("/api/commissioner/events/" + testEvent.getId() + "/competitions"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "SPECTATOR")
        @DisplayName("Accès spectateur aux endpoints commissioner doit retourner 403")
        void spectatorAccess_ShouldReturnForbidden() throws Exception {
            mockMvc.perform(get("/api/commissioner/events/" + testEvent.getId() + "/competitions"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "ATHLETE")
        @DisplayName("Accès athlète aux endpoints commissioner doit retourner 403")
        void athleteAccess_ShouldReturnForbidden() throws Exception {
            mockMvc.perform(get("/api/commissioner/events/" + testEvent.getId() + "/competitions"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Accès commissioner aux endpoints doit être autorisé")
        void commissionerAccess_ShouldBeAllowed() throws Exception {
            mockMvc.perform(get("/api/commissioner/events/" + testEvent.getId() + "/competitions"))
                    .andExpect(status().isOk());
        }
    }

    // ==================== TESTS GET COMPETITIONS PAR EVENT ====================

    @Nested
    @DisplayName("GET /api/commissioner/events/{eventId}/competitions")
    class GetCompetitionsByEventTests {

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner la liste des compétitions pour un événement existant")
        void getCompetitionsByEvent_WithExistingEvent_ShouldReturnCompetitions() throws Exception {
            mockMvc.perform(get("/api/commissioner/events/" + testEvent.getId() + "/competitions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].name", is("Natation Senior")))
                    .andExpect(jsonPath("$[0].parentEventId", is(testEvent.getId().intValue())));
        }

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner une liste vide pour un événement sans compétitions")
        void getCompetitionsByEvent_WithNoCompetitions_ShouldReturnEmptyList() throws Exception {
            // Créer un nouvel événement sans compétitions
            Event emptyEvent = new Event();
            emptyEvent.setName("Événement vide");
            emptyEvent.setStartDate(LocalDateTime.now().plusDays(30));
            emptyEvent.setEndDate(LocalDateTime.now().plusDays(40));
            emptyEvent = eventRepository.save(emptyEvent);

            mockMvc.perform(get("/api/commissioner/events/" + emptyEvent.getId() + "/competitions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner plusieurs compétitions si elles existent")
        void getCompetitionsByEvent_WithMultipleCompetitions_ShouldReturnAll() throws Exception {
            // Ajouter une deuxième compétition
            Competition secondCompetition = new Competition();
            secondCompetition.setName("Natation Junior");
            secondCompetition.setStartDate(LocalDateTime.now().plusDays(16));
            secondCompetition.setEndDate(LocalDateTime.now().plusDays(18));
            secondCompetition.setParentEvent(testEvent);
            competitionRepository.save(secondCompetition);

            mockMvc.perform(get("/api/commissioner/events/" + testEvent.getId() + "/competitions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    // ==================== TESTS GET TRIALS PAR COMPETITION ====================

    @Nested
    @DisplayName("GET /api/commissioner/competitions/{competitionId}/trials")
    class GetTrialsByCompetitionTests {

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner la liste des épreuves pour une compétition existante")
        void getTrialsByCompetition_WithExistingCompetition_ShouldReturnTrials() throws Exception {
            mockMvc.perform(get("/api/commissioner/competitions/" + testCompetition.getId() + "/trials"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].trialName", is("HUNDRED_M_FREESTYLE")))
                    .andExpect(jsonPath("$[0].competitionId", is(testCompetition.getId().intValue())));
        }

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner une liste vide pour une compétition sans épreuves")
        void getTrialsByCompetition_WithNoTrials_ShouldReturnEmptyList() throws Exception {
            // Créer une nouvelle compétition sans épreuves
            Competition emptyCompetition = new Competition();
            emptyCompetition.setName("Compétition vide");
            emptyCompetition.setStartDate(LocalDateTime.now().plusDays(25));
            emptyCompetition.setEndDate(LocalDateTime.now().plusDays(26));
            emptyCompetition.setParentEvent(testEvent);
            emptyCompetition = competitionRepository.save(emptyCompetition);

            mockMvc.perform(get("/api/commissioner/competitions/" + emptyCompetition.getId() + "/trials"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner plusieurs épreuves si elles existent")
        void getTrialsByCompetition_WithMultipleTrials_ShouldReturnAll() throws Exception {
            // Ajouter une deuxième épreuve
            Trial secondTrial = new Trial();
            secondTrial.setTrialName(TrialName.TWO_HUNDRED_M_FREESTYLE);
            secondTrial.setStartDate(LocalDate.now().plusDays(13));
            secondTrial.setStartHour(LocalTime.of(10, 0));
            secondTrial.setEndDate(LocalDate.now().plusDays(13));
            secondTrial.setEndHour(LocalTime.of(11, 0));
            secondTrial.setMode(TrialMode.INDIVIDUAL);
            secondTrial.setCategoryGender(CategoryGender.FEMALE);
            secondTrial.setCompetition(testCompetition);
            secondTrial.setSite(testSite);
            secondTrial.setRound(testRound);
            trialRepository.save(secondTrial);

            mockMvc.perform(get("/api/commissioner/competitions/" + testCompetition.getId() + "/trials"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    // ==================== TESTS PUT UPDATE TRIAL ====================

    @Nested
    @DisplayName("PUT /api/commissioner/trials/{id}")
    class UpdateTrialTests {

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit mettre à jour une épreuve avec des données valides")
        void updateTrial_WithValidData_ShouldReturnUpdatedTrial() throws Exception {
            String updateJson = String.format("""
                {
                    "trialName": "TWO_HUNDRED_M_FREESTYLE",
                    "roundNumber": 1,
                    "description": "200m nage libre - Mise à jour",
                    "rules": "Nouvelles règles",
                    "startDate": "%s",
                    "startHour": "15:00:00",
                    "endDate": "%s",
                    "endHour": "16:00:00",
                    "mode": "INDIVIDUAL",
                    "categoryGender": "FEMALE",
                    "siteId": %d,
                    "competitionId": %d,
                    "roundId": %d
                }
                """,
                LocalDate.now().plusDays(12),
                LocalDate.now().plusDays(12),
                testSite.getId(),
                testCompetition.getId(),
                testRound.getId());

            mockMvc.perform(put("/api/commissioner/trials/" + testTrial.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(updateJson))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.trialName", is("TWO_HUNDRED_M_FREESTYLE")))
                    .andExpect(jsonPath("$.description", is("200m nage libre - Mise à jour")))
                    .andExpect(jsonPath("$.categoryGender", is("FEMALE")));

            // Vérifier en base
            Trial updated = trialRepository.findById(testTrial.getId()).orElseThrow();
            assertEquals(TrialName.TWO_HUNDRED_M_FREESTYLE, updated.getTrialName());
            assertEquals("200m nage libre - Mise à jour", updated.getDescription());
        }

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner 400 avec des données invalides")
        void updateTrial_WithInvalidData_ShouldReturnBadRequest() throws Exception {
            // Missing required fields
            String invalidJson = """
                {
                    "description": "Description seulement"
                }
                """;

            mockMvc.perform(put("/api/commissioner/trials/" + testTrial.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "SPECTATOR")
        @DisplayName("Doit retourner 403 pour un spectateur")
        void updateTrial_AsSpectator_ShouldReturnForbidden() throws Exception {
            String updateJson = """
                {
                    "trialName": "HUNDRED_M_FREESTYLE",
                    "startDate": "2025-08-12",
                    "startHour": "14:00:00",
                    "endDate": "2025-08-12",
                    "endHour": "15:00:00",
                    "mode": "INDIVIDUAL",
                    "categoryGender": "MALE",
                    "siteId": 1,
                    "competitionId": 1,
                    "roundId": 1
                }
                """;

            mockMvc.perform(put("/api/commissioner/trials/" + testTrial.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(updateJson))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== TESTS PATCH CANCEL TRIAL ====================

    @Nested
    @DisplayName("PATCH /api/commissioner/trials/{id}/cancel")
    class CancelTrialTests {

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit annuler une épreuve à venir")
        void cancelTrial_WithUpcomingTrial_ShouldCancelSuccessfully() throws Exception {
            mockMvc.perform(patch("/api/commissioner/trials/" + testTrial.getId() + "/cancel"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cancelled", is(true)))
                    .andExpect(jsonPath("$.status", is("CANCELED")));

            // Vérifier en base
            Trial cancelled = trialRepository.findById(testTrial.getId()).orElseThrow();
            assertTrue(cancelled.isCancelled());
            assertNotNull(cancelled.getCancelledAt());
        }

        @Test
        @WithMockUser(roles = "SPECTATOR")
        @DisplayName("Doit retourner 403 pour un spectateur")
        void cancelTrial_AsSpectator_ShouldReturnForbidden() throws Exception {
            mockMvc.perform(patch("/api/commissioner/trials/" + testTrial.getId() + "/cancel"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(username = "commissioner@test.com", roles = "COMMISSIONNER")
        @DisplayName("Doit retourner une erreur pour une épreuve déjà annulée")
        void cancelTrial_AlreadyCancelled_ShouldReturnError() throws Exception {
            // Annuler l'épreuve une première fois
            testTrial.setCancelled(true);
            testTrial.setCancelledAt(LocalDateTime.now());
            trialRepository.save(testTrial);

            mockMvc.perform(patch("/api/commissioner/trials/" + testTrial.getId() + "/cancel"))
                    .andExpect(status().isBadRequest());
        }
    }
}
