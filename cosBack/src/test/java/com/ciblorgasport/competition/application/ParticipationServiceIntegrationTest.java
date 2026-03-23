package com.ciblorgasport.competition.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.team.infrastructure.TeamRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ParticipationServiceIntegrationTest {

    @Autowired
    private ParticipationService participationService;

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TeamRepository teamRepository;

    @MockBean
    private StorageService storageService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private NotificationService notificationService;

    private Athlete testAthlete;
    private Competition testCompetition;
    private Participation testParticipation;
    private Document testPassport;

    @BeforeEach
    void setUp() {
        Event testEvent = new Event();
        testEvent.setName("Test Event");
        testEvent.setStartDate(LocalDateTime.now().plusDays(5));
        testEvent.setEndDate(LocalDateTime.now().plusDays(20));
        testEvent = eventRepository.save(testEvent);

        testCompetition = new Competition();
        testCompetition.setParentEvent(testEvent);
        testCompetition.setName("Compétition Test Integration");
        testCompetition.setStartDate(LocalDateTime.now().plusDays(10));
        testCompetition.setEndDate(LocalDateTime.now().plusDays(15));
        competitionRepository.save(testCompetition);

        testAthlete = new Athlete();
        testAthlete.setFirstName("Int");
        testAthlete.setLastName("Athlete");
        testAthlete.setEmail("int@test.com");
        testAthlete.setPassword("pass1234");
        
        testPassport = Document.builder()
                .s3Key("athletes/1/passport.pdf")
                .fileName("passport.pdf")
                .bucketName("ciblorgasport")
                .contentType("application/pdf")
                .fileSize(1024L)
                .uploadedAt(LocalDateTime.now())
                .build();
        testAthlete.setPassportDocument(testPassport);
        
        testAthlete = athleteRepository.saveAndFlush(testAthlete);

        testParticipation = new Participation();
        testParticipation.setCompetitorId(testAthlete.getId());
        testParticipation.setCompetitorType(CompetitorType.ATHLETE);
        testParticipation.setCompetition(testCompetition);
        testParticipation.setStatus(ParticipationStatus.PENDING_VALIDATION);
        testParticipation = participationRepository.saveAndFlush(testParticipation);
    }

    @Test
    @DisplayName("Devrait valider la participation et refuser un document spécifique (intégration base de données)")
    void shouldValidateParticipationAndRejectSpecificDocument() {
        participationService.validateParticipation(testParticipation.getId(), false, "PASSPORT", "Flou");

        // The participation should be reverted to PENDING
        Participation updatedParticipation = participationRepository.findById(testParticipation.getId()).orElseThrow();
        assertEquals(ParticipationStatus.PENDING, updatedParticipation.getStatus());
        
        // The athlete's passport should be null in the database
        Athlete updatedAthlete = athleteRepository.findById(testAthlete.getId()).orElseThrow();
        assertNull(updatedAthlete.getPassportDocument());
        
        // Verification that the storage service mock was told to delete it (since S3 calls are mocked here)
        verify(storageService).deleteFile(any(Document.class));
    }
    
    @Test
    @DisplayName("Devrait évaluer correctement isConfirmed (test d'intégration pour individual)")
    void shouldCorrectlyEvaluateIsConfirmed() {
        // Current state is PENDING_VALIDATION
        boolean confirmedBefore = participationService.isConfirmed(testAthlete.getId(), testCompetition.getId());
        assertFalse(confirmedBefore);
        
        // Confirm it
        testParticipation.setStatus(ParticipationStatus.CONFIRMED);
        participationRepository.saveAndFlush(testParticipation);
        
        boolean confirmedAfter = participationService.isConfirmed(testAthlete.getId(), testCompetition.getId());
        assertTrue(confirmedAfter);
    }
}
