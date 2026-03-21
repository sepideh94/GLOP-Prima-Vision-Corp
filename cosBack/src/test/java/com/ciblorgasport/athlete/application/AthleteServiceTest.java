package com.ciblorgasport.athlete.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
import com.ciblorgasport.athlete.dto.AthleteProfileUpdateRequest;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.commissionner.CommissionerRepository;
import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.team.application.TeamValidationService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@ExtendWith(MockitoExtension.class)
class AthleteServiceTest {

    @Mock
    private AthleteRepository athleteRepository;
    @Mock
    private ParticipationRepository participationRepository;
    @Mock
    private TeamValidationService teamValidationService;
    @Mock
    private CommissionerRepository commissionerRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private UserAccountRepository userAccountRepository;

    @InjectMocks
    private AthleteService athleteService;

    private Athlete testAthlete;
    private Participation testParticipation;
    private Commissionner testCommissioner;
    private UserAccount testUserAccount;

    @BeforeEach
    void setUp() {
        testAthlete = new Athlete();
        testAthlete.setId(1L);
        testAthlete.setFirstName("Jane");
        testAthlete.setLastName("Doe");
        testAthlete.setPassportDocument(new Document());
        testAthlete.setMedicalCertificate(new Document());
        testAthlete.setNationality("Française");
        testAthlete.setBirthDate(java.time.LocalDate.of(1990, 1, 1));
        testAthlete.setSexe("M");
        testAthlete.setPassportNumber("TEST1234");
        testAthlete.setHasAcceptedCharte(false);

        testParticipation = new Participation();
        testParticipation.setId(100L);
        testParticipation.setCompetitorId(1L);
        testParticipation.setCompetitorType(CompetitorType.ATHLETE);
        Competition comp = new Competition();
        comp.setId(10L);
        testParticipation.setCompetition(comp);
        testParticipation.setStatus(ParticipationStatus.PENDING);

        testCommissioner = new Commissionner();
        testCommissioner.setId(50L);

        testUserAccount = new com.ciblorgasport.commissionner.Commissionner();
        testUserAccount.setId(50L);
        testUserAccount.setEmail("commissioner@test.com");
        testUserAccount.setFirstName("Commis");
    }

    @Test
    @DisplayName("Doit notifier les commissaires lorsque le profil est complet et la participation passe en PENDING_VALIDATION")
    void updateAthleteProfile_CompleteProfile_TriggersNotifications() {
        when(athleteRepository.findById(1L)).thenReturn(Optional.of(testAthlete));
        when(athleteRepository.save(any(Athlete.class))).thenReturn(testAthlete);
        
        when(participationRepository.findByCompetitorIdAndCompetitorType(1L, CompetitorType.ATHLETE))
            .thenReturn(List.of(testParticipation));
            
        when(commissionerRepository.findAll()).thenReturn(List.of(testCommissioner));
        when(userAccountRepository.findById(50L)).thenReturn(Optional.of(testUserAccount));

        AthleteProfileUpdateRequest req = new AthleteProfileUpdateRequest();
        req.setHasAcceptedCharte(true);

        athleteService.updateAthleteProfile(1L, req);

        // Assert participation status is changed
        assertEquals(ParticipationStatus.PENDING_VALIDATION, testParticipation.getStatus());
        verify(participationRepository).saveAndFlush(testParticipation);

        // Assert notifications are sent to the commissioner
        verify(emailService).sendCommissionerParticipationSubmittedEmail(
            eq("commissioner@test.com"), eq("Commis"), eq("Jane Doe")
        );
        
        verify(notificationService).createSystemNotification(
            eq(testUserAccount),
            eq(NotificationType.PARTICIPATION_SUBMITTED),
            anyString(),
            anyString(),
            eq("/commissioner/participations")
        );
    }
    
    @Test
    @DisplayName("Ne doit pas notifier si le profil est incomplet")
    void updateAthleteProfile_IncompleteProfile_NoNotifications() {
        testAthlete.setPassportDocument(null); // Incomplete profile

        when(athleteRepository.findById(1L)).thenReturn(Optional.of(testAthlete));
        when(athleteRepository.save(any(Athlete.class))).thenReturn(testAthlete);

        AthleteProfileUpdateRequest req = new AthleteProfileUpdateRequest();
        req.setHasAcceptedCharte(true);

        athleteService.updateAthleteProfile(1L, req);

        verify(participationRepository, never()).findByCompetitorIdAndCompetitorType(any(), any());
        verify(emailService, never()).sendCommissionerParticipationSubmittedEmail(any(), any(), any());
    }
}
