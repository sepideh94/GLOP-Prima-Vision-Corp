package com.ciblorgasport.team.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
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
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.application.AthleteCreationService;
import com.ciblorgasport.athlete.application.AthleteInviteBatchService;
import com.ciblorgasport.athlete.application.AthleteInviteTokenService;
import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.dto.TeamImportResult;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import com.ciblorgasport.user.dto.CreateUserRequest;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class TeamImportServiceTest {

    @Mock
    private CsvImportService csvService;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private AthleteRepository athleteRepository;
    @Mock
    private AthleteCreationService athleteCreationService;
    @Mock
    private CompetitionRepository competitionRepository;
    @Mock
    private ParticipationRepository participationRepository;
    @Mock
    private AthleteInviteTokenService athleteInviteTokenService;
    @Mock
    private AthleteInviteBatchService athleteInviteBatchService;

    @InjectMocks
    private TeamImportService teamImportService;

    private Competition competition;
    private Athlete athlete;
    private Team team;

    @BeforeEach
    void setUp() {
        TransactionSynchronizationManager.initSynchronization();

        competition = new Competition();
        competition.setId(1L);

        athlete = new Athlete();
        athlete.setId(10L);
        athlete.setEmail("athlete@test.com");

        team = new Team();
        team.setId(100L);
        team.setName("Dream Team");
        team.setMembers(new ArrayList<>());
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    void importTeamsForCompetition_WhenCompetitionNotFound_ThrowsException() {
        MultipartFile file = new MockMultipartFile("file", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, 
            () -> teamImportService.importTeamsForCompetition(file, 1L));
    }

    @Test
    void importTeamsForCompetition_WhenValidFormat_ShouldProcessRecords() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        CSVRecord newRecord = mock(CSVRecord.class);
        when(newRecord.get("teamName")).thenReturn("Dream Team");
        when(newRecord.get("email")).thenReturn("new@test.com");
        when(newRecord.get("firstName")).thenReturn("John");
        when(newRecord.get("lastName")).thenReturn("Doe");

        CSVRecord existingRecord = mock(CSVRecord.class);
        when(existingRecord.get("teamName")).thenReturn("Dream Team");
        when(existingRecord.get("email")).thenReturn("athlete@test.com");

        when(csvService.parseCsv(file)).thenReturn(List.of(newRecord, existingRecord));

        // For new Record
        when(athleteRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(athleteRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        Athlete newAthlete = new Athlete();
        newAthlete.setId(11L);
        newAthlete.setEmail("new@test.com");
        when(athleteCreationService.createUser(any(CreateUserRequest.class))).thenReturn(newAthlete);
        when(athleteInviteTokenService.createInviteToken(newAthlete)).thenReturn("dummy-token");

        // For existing Record
        when(athleteRepository.existsByEmail("athlete@test.com")).thenReturn(true);
        when(athleteRepository.findByEmail("athlete@test.com")).thenReturn(Optional.of(athlete));

        // Team management
        when(teamRepository.findByName("Dream Team")).thenReturn(Optional.of(team));
        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> inv.getArgument(0));

        // Participation management
        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorType(
            eq(1L), anyLong(), any())).thenReturn(false);

        TeamImportResult result = teamImportService.importTeamsForCompetition(file, 1L);

        assertThat(result.teamsProcessed()).isEqualTo(2); // Two lines processed successfully
        assertThat(result.athletesCreated()).isEqualTo(1);
        assertThat(result.skippedLines()).isEqualTo(0);

        verify(athleteInviteTokenService, times(1)).createInviteToken(newAthlete);
        verify(participationRepository, times(4)).save(any(Participation.class)); // 2 for team, 2 for athletes
    }

    @Test
    void importTeamsForCompetition_WhenRecordThrowsException_ShouldSkipRecord() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        CSVRecord invalidRecord = mock(CSVRecord.class);
        when(invalidRecord.get("teamName")).thenThrow(new IllegalArgumentException("Invalid format"));

        when(csvService.parseCsv(file)).thenReturn(List.of(invalidRecord));

        TeamImportResult result = teamImportService.importTeamsForCompetition(file, 1L);

        assertThat(result.teamsProcessed()).isEqualTo(0);
        assertThat(result.skippedLines()).isEqualTo(1);
    }
}
