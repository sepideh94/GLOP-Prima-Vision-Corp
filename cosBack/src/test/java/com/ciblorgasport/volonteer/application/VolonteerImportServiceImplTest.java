package com.ciblorgasport.volonteer.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.apache.commons.csv.CSVRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;
import com.ciblorgasport.volonteer.domain.VolonteerCompetitionResponse;
import com.ciblorgasport.volonteer.infrastructure.VolonteerAssignmentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;
import com.ciblorgasport.volonteer.application.VolonteerImportService.ImportResult;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class VolonteerImportServiceImplTest {

    @Mock
    private CsvImportService csvService;
    @Mock
    private VolonteerCreationService volonteerCreationService;
    @Mock
    private VolonteerRepository volonteerRepository;
    @Mock
    private CompetitionRepository competitionRepository;
    @Mock
    private VolonteerInviteTokenService volonteerInviteTokenService;
    @Mock
    private VolonteerInviteBatchService volonteerInviteBatchService;
    @Mock
    private VolonteerAssignmentRepository assignmentRepository;

    @InjectMocks
    private VolonteerImportServiceImpl volonteerImportService;

    private Competition competition;
    private Volonteer volonteer;

    @BeforeEach
    void setUp() {
        competition = new Competition();
        competition.setId(1L);
        competition.setName("Compétition Test");

        volonteer = new Volonteer();
        volonteer.setId(10L);
        volonteer.setEmail("test@volonteer.com");
        volonteer.setFirstName("Jean");
        volonteer.setLastName("Dupont");
    }

    @Test
    void importVolonteersForCompetition_WhenCompetitionNotFound_ThrowsException() {
        MultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, 
            () -> volonteerImportService.importVolonteersForCompetition(file, 1L));
    }

    @Test
    void importVolonteersForCompetition_WhenValid_ShouldParseAndInvite() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", "dummy".getBytes());
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        CSVRecord record1 = mock(CSVRecord.class);
        when(record1.get("email")).thenReturn("new@volonteer.com");
        when(record1.get("firstName")).thenReturn("Nouveau");
        when(record1.get("lastName")).thenReturn("Vol");

        CSVRecord record2 = mock(CSVRecord.class);
        when(record2.get("email")).thenReturn("test@volonteer.com");

        when(csvService.parseCsv(file)).thenReturn(List.of(record1, record2));

        // For record1 (new volunteer)
        when(volonteerRepository.findByEmail("new@volonteer.com")).thenReturn(Optional.empty());
        Volonteer newVol = new Volonteer();
        newVol.setId(11L);
        newVol.setEmail("new@volonteer.com");
        when(volonteerCreationService.createUser(any(CreateUserRequest.class))).thenReturn(newVol);
        when(assignmentRepository.existsByVolonteerIdAndCompetitionId(11L, 1L)).thenReturn(false);

        // For record2 (existing volunteer)
        when(volonteerRepository.findByEmail("test@volonteer.com")).thenReturn(Optional.of(volonteer));
        when(assignmentRepository.existsByVolonteerIdAndCompetitionId(10L, 1L)).thenReturn(true);

        ImportResult result = volonteerImportService.importVolonteersForCompetition(file, 1L);

        assertThat(result.processed()).isEqualTo(2);
        assertThat(result.invited()).isEqualTo(1);

        verify(assignmentRepository, times(1)).save(any(VolonteerAssignment.class));
    }

    @Test
    void inviteToCompetition_WhenExists_ShouldReturnFalse() {
        when(assignmentRepository.existsByVolonteerIdAndCompetitionId(10L, 1L)).thenReturn(true);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        boolean result = volonteerImportService.inviteToCompetition(volonteer, 1L);

        assertThat(result).isFalse();
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void updateVolonteerAssignmentsToAccepted_ShouldUpdateStatus() {
        VolonteerAssignment assignment1 = new VolonteerAssignment();
        assignment1.setStatus(ParticipationStatus.INVITED);
        VolonteerAssignment assignment2 = new VolonteerAssignment();
        assignment2.setStatus(ParticipationStatus.INVITED);

        when(assignmentRepository.findByVolonteerId(10L)).thenReturn(List.of(assignment1, assignment2));

        volonteerImportService.updateVolonteerAssignmentsToAccepted(10L);

        assertThat(assignment1.getStatus()).isEqualTo(ParticipationStatus.CONFIRMED);
        assertThat(assignment2.getStatus()).isEqualTo(ParticipationStatus.CONFIRMED);
        verify(assignmentRepository, times(2)).save(any(VolonteerAssignment.class));
    }

    @Test
    void getVolonteersByCompetition_ShouldReturnResponses() {
        VolonteerAssignment assignment = new VolonteerAssignment();
        assignment.setVolonteer(volonteer);
        assignment.setCompetition(competition);
        assignment.setStatus(ParticipationStatus.CONFIRMED);
        assignment.setStartTime(null);

        when(assignmentRepository.findByCompetitionId(1L)).thenReturn(List.of(assignment));

        List<VolonteerCompetitionResponse> responses = volonteerImportService.getVolonteersByCompetition(1L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getEmail()).isEqualTo("test@volonteer.com");
        assertThat(responses.get(0).getCompetitionName()).isEqualTo("Compétition Test");
    }

    @Test
    void getAllVolonteersByEvent_ShouldReturnResponses() {
        when(competitionRepository.findByParentEventId(100L)).thenReturn(List.of(competition));
        
        VolonteerAssignment assignment = new VolonteerAssignment();
        assignment.setVolonteer(volonteer);
        assignment.setCompetition(competition);
        assignment.setStatus(ParticipationStatus.INVITED);
        assignment.setStartTime(null);

        when(assignmentRepository.findByCompetitionId(1L)).thenReturn(List.of(assignment));

        List<VolonteerCompetitionResponse> responses = volonteerImportService.getAllVolonteersByEvent(100L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getEmail()).isEqualTo("test@volonteer.com");
    }
}
