package com.ciblorgasport.competition.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import jakarta.persistence.EntityNotFoundException;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.dto.AthleteCompetitionDetailsResponse;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import com.ciblorgasport.team.application.TeamValidationService;

@ExtendWith(MockitoExtension.class)
class ParticipationServiceTest {

    @Mock
    private ParticipationRepository participationRepository;

    @Mock
    private AthleteRepository athleteRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private StorageService storageService;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private TeamValidationService teamValidationService;

    @InjectMocks
    private ParticipationService participationService;

    private Athlete testAthlete;
    private Competition testCompetition;
    private Participation testParticipation;
    private Document passportDoc;
    private Document medicalDoc;

    @BeforeEach
    void setUp() {
        // Correction : On donne des identifiants et des clés uniques pour que Mockito 
        // ne considère pas les deux documents comme identiques (Lombok @Data).
        passportDoc = Document.builder()
                .id(1L)
                .s3Key("athletes/1/passport.pdf")
                .fileName("passport.pdf")
                .build();

        medicalDoc = Document.builder()
                .id(2L)
                .s3Key("athletes/1/medical.pdf")
                .fileName("medical.pdf")
                .build();

        testAthlete = new Athlete();
        testAthlete.setId(1L);
        testAthlete.setFirstName("John");
        testAthlete.setLastName("Doe");
        testAthlete.setEmail("john.doe@test.com");
        testAthlete.setPassportDocument(passportDoc);
        testAthlete.setMedicalCertificate(medicalDoc);
        testAthlete.setHasAcceptedCharte(true);

        testCompetition = new Competition();
        testCompetition.setId(10L);

        testParticipation = new Participation();
        testParticipation.setId(100L);
        testParticipation.setCompetitorId(testAthlete.getId());
        testParticipation.setCompetitorType(CompetitorType.ATHLETE);
        testParticipation.setCompetition(testCompetition);
        testParticipation.setStatus(ParticipationStatus.PENDING_VALIDATION);
    }

    @Test
    @DisplayName("Doit valider la participation et notifier l'athlète")
    void validateParticipation_Confirm() {
        when(participationRepository.findById(100L)).thenReturn(Optional.of(testParticipation));
        when(athleteRepository.findById(testAthlete.getId())).thenReturn(Optional.of(testAthlete));
        // Athlete hérite de UserAccount, ce mock est donc valide.
        when(userAccountRepository.findByEmail(testAthlete.getEmail())).thenReturn(Optional.of(testAthlete));

        participationService.validateParticipation(100L, true);

        assertEquals(ParticipationStatus.CONFIRMED, testParticipation.getStatus());
        verify(participationRepository).saveAndFlush(testParticipation);
        verify(teamValidationService).validateTeamStatus(testAthlete.getId(), testCompetition.getId());
        verify(notificationService).createSystemNotification(
            eq(testAthlete),
            eq(NotificationType.PARTICIPATION_VALIDATED),
            eq("Documents validés"),
            anyString(),
            eq("/athlete/competitions")
        );
        verify(emailService).sendAthleteParticipationValidatedEmail(
            eq(testAthlete.getEmail()),
            eq(testAthlete.getFirstName())
        );
    }

    @Test
    @DisplayName("Doit refuser un document ciblé (PASSPORT) et réinitialiser la participation")
    void validateParticipation_RefusePassport() {
        when(participationRepository.findById(100L)).thenReturn(Optional.of(testParticipation));
        when(athleteRepository.findById(testAthlete.getId())).thenReturn(Optional.of(testAthlete));
        when(athleteRepository.save(any(Athlete.class))).thenReturn(testAthlete);
        when(userAccountRepository.findByEmail(testAthlete.getEmail())).thenReturn(Optional.of(testAthlete));

        participationService.validateParticipation(100L, false, "PASSPORT", "Photo floue");

        assertNull(testAthlete.getPassportDocument());
        assertEquals(medicalDoc, testAthlete.getMedicalCertificate());

        // Vérifie que seul le passeport a été supprimé du stockage.
        verify(storageService).deleteFile(passportDoc);
        verify(storageService, never()).deleteFile(medicalDoc);

        assertEquals(ParticipationStatus.PENDING, testParticipation.getStatus());
        verify(emailService).sendAthleteParticipationRefusedEmail(
            eq(testAthlete.getEmail()),
            eq(testAthlete.getFirstName()),
            eq("PASSPORT"),
            eq("Photo floue")
        );
    }

    @Test
    @DisplayName("Doit refuser les deux documents et réinitialiser la participation")
    void validateParticipation_RefuseBoth() {
        when(participationRepository.findById(100L)).thenReturn(Optional.of(testParticipation));
        when(athleteRepository.findById(testAthlete.getId())).thenReturn(Optional.of(testAthlete));
        when(athleteRepository.save(any(Athlete.class))).thenReturn(testAthlete);
        when(userAccountRepository.findByEmail(testAthlete.getEmail())).thenReturn(Optional.of(testAthlete));

        participationService.validateParticipation(100L, false, "BOTH", "Documents illisibles");

        assertNull(testAthlete.getPassportDocument());
        assertNull(testAthlete.getMedicalCertificate());

        // Grâce aux S3Keys/IDs différents, Mockito distingue maintenant ces deux appels.
        verify(storageService).deleteFile(passportDoc);
        verify(storageService).deleteFile(medicalDoc);

        verify(notificationService).createSystemNotification(
            eq(testAthlete),
            eq(NotificationType.PARTICIPATION_REFUSED),
            eq("Documents refusés"),
            anyString(),
            eq("/athlete/profile")
        );
    }

    @Test
    @DisplayName("Doit jeter EntityNotFoundException si la participation n'existe pas")
    void validateParticipation_NotFound() {
        when(participationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            participationService.validateParticipation(999L, true);
        });
    }

    @Test
    @DisplayName("isConfirmed retourne true quand la participation de l'athlète est confirmée")
    void isConfirmed_ReturnsTrue() {
        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                10L, 1L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)).thenReturn(true);

        boolean result = participationService.isConfirmed(1L, 10L);

        assertTrue(result);
        verify(participationRepository).existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                10L, 1L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED);
    }

    @Test
    @DisplayName("isConfirmed retourne false quand la participation athlète n'est pas confirmée")
    void isConfirmed_ReturnsFalse() {
        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                10L, 1L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)).thenReturn(false);

        boolean result = participationService.isConfirmed(1L, 10L);

        assertFalse(result);
        verify(participationRepository).existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                10L, 1L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED);
    }

    @Test
    @DisplayName("getAthleteDashboardCards retourne les cartes correctement avec dedoublonnage")
    void getAthleteDashboardCards_Success() {
        when(participationRepository.findAllDirectAndTeamParticipations(testAthlete.getId()))
                .thenReturn(List.of(testParticipation));

        List<AthleteCompetitionDetailsResponse> cards = participationService.getAthleteDashboardCards(testAthlete.getId());

        assertNotNull(cards);
        assertEquals(1, cards.size());
        assertEquals(100L, cards.get(0).getParticipationId());
        verify(participationRepository).findAllDirectAndTeamParticipations(testAthlete.getId());
    }
}