package com.ciblorgasport.athlete.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.commons.csv.CSVRecord;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.application.AthleteImportService.ImportResult;
import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.user.dto.CreateUserRequest;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class AthleteImportServiceTest {

    @Mock
    private CsvImportService csvService;
    @Mock
    private AthleteCreationService athleteCreationService;
    @Mock
    private AthleteRepository athleteRepository;
    @Mock
    private CompetitionRepository competitionRepository;
    @Mock
    private ParticipationRepository participationRepository;
    @Mock
    private AthleteInviteTokenService athleteInviteTokenService;
    @Mock
    private AthleteInviteBatchService athleteInviteBatchService;

    @InjectMocks
    private AthleteImportService athleteImportService;

    private Competition competition;
    private Athlete athlete;

    @BeforeEach
    void setUp() {
        TransactionSynchronizationManager.initSynchronization();

        competition = new Competition();
        competition.setId(1L);

        athlete = new Athlete();
        athlete.setId(10L);
        athlete.setEmail("athlete@test.com");
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    void importAthletesForCompetition_WhenCompetitionNotFound_ThrowsException() {
        MultipartFile file = new MockMultipartFile("file", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, 
            () -> athleteImportService.importAthletesForCompetition(file, 1L));
    }

    @Test
    void importAthletesForCompetition_WhenValidFormat_ShouldProcessRecords() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        CSVRecord newRecord = mock(CSVRecord.class);
        when(newRecord.get("email")).thenReturn("new@test.com");
        when(newRecord.get("firstName")).thenReturn("John");
        when(newRecord.get("lastName")).thenReturn("Doe");

        CSVRecord existingRecord = mock(CSVRecord.class);
        when(existingRecord.get("email")).thenReturn("athlete@test.com");

        when(csvService.parseCsv(file)).thenReturn(List.of(newRecord, existingRecord));

        // For new Record
        when(athleteRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        Athlete newAthlete = new Athlete();
        newAthlete.setId(11L);
        newAthlete.setEmail("new@test.com");
        when(athleteCreationService.createUser(any(CreateUserRequest.class))).thenReturn(newAthlete);
        when(athleteInviteTokenService.createInviteToken(newAthlete)).thenReturn("dummy-token");

        // For existing Record
        when(athleteRepository.findByEmail("athlete@test.com")).thenReturn(Optional.of(athlete));

        // Participation management
        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorType(
            eq(1L), anyLong(), any())).thenReturn(false);

        ImportResult result = athleteImportService.importAthletesForCompetition(file, 1L);

        assertThat(result.processed()).isEqualTo(2); // total created is called 'processed'
        assertThat(result.invited()).isEqualTo(2); // Two athletes invited successfully
        assertThat(result.skipped()).isEqualTo(0);

        verify(athleteInviteTokenService, times(1)).createInviteToken(newAthlete);
        verify(participationRepository, times(2)).save(any(Participation.class));
    }

    @Test
    void importAthletesForCompetition_WhenRecordThrowsException_ShouldSkipRecord() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        CSVRecord invalidRecord = mock(CSVRecord.class);
        when(invalidRecord.get("email")).thenThrow(new IllegalArgumentException("Invalid format"));

        when(csvService.parseCsv(file)).thenReturn(List.of(invalidRecord));

        ImportResult result = athleteImportService.importAthletesForCompetition(file, 1L);

        // Skipped includes both parsing errors or already invited
        assertThat(result.processed()).isEqualTo(0);
        assertThat(result.skipped()).isEqualTo(1);
    }

    @Test
    void importAthletesForCompetition_ProfileComplete_ShouldCreatePendingValidationNotConfirmed() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        CSVRecord existingRecord = mock(CSVRecord.class);
        when(existingRecord.get("email")).thenReturn("athlete@test.com");
        when(csvService.parseCsv(file)).thenReturn(List.of(existingRecord));

        athlete.setActive(true);
        athlete.setNationality("FR");
        athlete.setSexe("M");
        athlete.setBirthDate(java.time.LocalDate.of(2000, 1, 1));
        athlete.setPassportNumber("AA123456");
        athlete.setPassportDocument(new com.ciblorgasport.storage.domain.Document());
        athlete.setMedicalCertificate(new com.ciblorgasport.storage.domain.Document());
        athlete.setHasAcceptedCharte(true);

        when(athleteRepository.findByEmail("athlete@test.com")).thenReturn(Optional.of(athlete));
        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorType(
                eq(1L), eq(10L), eq(CompetitorType.ATHLETE))).thenReturn(false);

        athleteImportService.importAthletesForCompetition(file, 1L);

        org.mockito.ArgumentCaptor<Participation> captor =
                org.mockito.ArgumentCaptor.forClass(Participation.class);
        verify(participationRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(ParticipationStatus.PENDING_VALIDATION);
    }
}
