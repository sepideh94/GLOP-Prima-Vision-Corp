package com.ciblorgasport.commissionner.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.application.AthleteCreationService;
import com.ciblorgasport.athlete.application.AthleteImportService;
import com.ciblorgasport.athlete.application.AthleteService;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.dto.CompetitionAthleteResponse;
import com.ciblorgasport.commissionner.CommissionnerAccreditationService;
import com.ciblorgasport.commissionner.CommissionnerController;
import com.ciblorgasport.competition.application.CompetitionService;
import com.ciblorgasport.competition.application.ParticipationService;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.ParticipantResponse;
import com.ciblorgasport.competition.dto.RefuseParticipationRequest;
import com.ciblorgasport.team.application.TeamImportService;
import com.ciblorgasport.team.dto.TeamImportResult;
import com.ciblorgasport.team.dto.TeamResponse;
import com.ciblorgasport.trial.application.TrialParticipantService;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.AssignAthletesRequest;
import com.ciblorgasport.trial.dto.AssignTeamsRequest;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;

@ExtendWith(MockitoExtension.class)
class CommissionnerControllerUnitTest {

    @Mock private AthleteCreationService athleteCreationService;
    @Mock private AthleteImportService athleteImportService;
    @Mock private AthleteService athleteService;
    @Mock private CompetitionService competitionService;
    @Mock private ParticipationService participationService;
    @Mock private TrialService trialService;
    @Mock private TrialParticipantService trialParticipantService;
    @Mock private TeamImportService teamImportService;
    @Mock private CommissionnerAccreditationService accreditationService;
    @Mock private Authentication authentication;

    @InjectMocks
    private CommissionnerController controller;

    @BeforeEach
    void setUp() {
        org.mockito.Mockito.lenient().when(authentication.getName()).thenReturn("test@test.com");
    }

    @Test
    void testCreateAthlete() {
        CreateUserRequest req = new CreateUserRequest();
        UserAccount mockAcc = mock(UserAccount.class);
        when(mockAcc.getId()).thenReturn(1L);
        when(mockAcc.getEmail()).thenReturn("a@a.com");
        when(mockAcc.getRoleName()).thenReturn("ROLE_ATHLETE");
        when(athleteCreationService.createUser(req)).thenReturn(mockAcc);

        ResponseEntity<?> response = controller.createAthlete(req, authentication);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testImportAthletesForCompetition() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        AthleteImportService.ImportResult result = new AthleteImportService.ImportResult(5, 3, 2);
        when(athleteImportService.importAthletesForCompetition(file, 10L)).thenReturn(result);

        ResponseEntity<?> res = controller.importAthletesForCompetition(10L, file, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testGetCompetition() {
        CompetitionResponse mockRes = mock(CompetitionResponse.class);
        when(competitionService.getCompetitionById(1L)).thenReturn(mockRes);

        ResponseEntity<CompetitionResponse> response = controller.getCompetition(1L);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testAssignAthletes() {
        AssignAthletesRequest req = new AssignAthletesRequest();
        req.setAthleteIds(List.of(1L));
        TrialParticipantResponse tpr = mock(TrialParticipantResponse.class);
        when(trialParticipantService.assignAthletes(eq(10L), any())).thenReturn(List.of(tpr));

        ResponseEntity<List<TrialParticipantResponse>> res = controller.assignAthletes(10L, req, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testGetTrialAthletes() {
        TrialParticipantResponse tpr = mock(TrialParticipantResponse.class);
        when(trialParticipantService.getByTrialId(1L)).thenReturn(List.of(tpr));

        ResponseEntity<List<TrialParticipantResponse>> res = controller.getTrialAthletes(1L);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testRemoveAthlete() {
        ResponseEntity<Void> res = controller.removeAthlete(1L, 2L, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(trialParticipantService).removeAthlete(1L, 2L);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testGetEligibleAthletes() {
        AthleteResponse ar = mock(AthleteResponse.class);
        when(trialParticipantService.getEligibleAthletes(1L)).thenReturn(List.of(ar));

        ResponseEntity<List<AthleteResponse>> res = controller.getEligibleAthletes(1L);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testGetAllAthletes() {
        AthleteResponse ar = mock(AthleteResponse.class);
        when(athleteService.getAllAthletes()).thenReturn(List.of(ar));

        ResponseEntity<List<AthleteResponse>> res = controller.getAllAthletes();
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testGetAthletesByCompetition() {
        CompetitionAthleteResponse car = mock(CompetitionAthleteResponse.class);
        when(athleteService.getAthletesByCompetition(1L)).thenReturn(List.of(car));

        ResponseEntity<List<CompetitionAthleteResponse>> res = controller.getAthletesByCompetition(1L);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testGetParticipationsByAthlete() {
        ParticipantResponse pr = mock(ParticipantResponse.class);
        when(participationService.getParticipationsByAthlete(1L)).thenReturn(List.of(pr));

        ResponseEntity<List<ParticipantResponse>> res = controller.getParticipationsByAthlete(1L);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testGetAthleteProfile() {
        AthleteResponse ar = mock(AthleteResponse.class);
        when(athleteService.getAthleteProfile(1L)).thenReturn(ar);

        ResponseEntity<AthleteResponse> res = controller.getAthleteProfile(1L);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testDownloadAthleteMedicalCertificate() {
        byte[] data = new byte[]{1, 2, 3};
        when(athleteService.downloadMedicalCertificate(1L)).thenReturn(data);
        when(athleteService.getMedicalCertificateContentType(1L)).thenReturn("application/pdf");

        ResponseEntity<byte[]> res = controller.downloadAthleteMedicalCertificate(1L, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isEqualTo(data);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testDownloadAthletePassport() {
        byte[] data = new byte[]{1, 2, 3};
        when(athleteService.downloadPassport(1L)).thenReturn(data);
        when(athleteService.getPassportContentType(1L)).thenReturn("image/jpeg");

        ResponseEntity<byte[]> res = controller.downloadAthletePassport(1L, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isEqualTo(data);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testValidateAthleteParticipation() {
        ResponseEntity<Void> res = controller.validateAthleteParticipation(1L, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(participationService).validateParticipation(1L, true);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testImportTeams() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        TeamImportResult result = mock(TeamImportResult.class);
        when(teamImportService.importTeamsForCompetition(file, 1L)).thenReturn(result);

        ResponseEntity<TeamImportResult> res = controller.importTeams(1L, file, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testAssignTeams() {
        AssignTeamsRequest req = new AssignTeamsRequest();
        req.setTeamIds(List.of(1L));
        TrialParticipantResponse tpr = mock(TrialParticipantResponse.class);
        when(trialParticipantService.assignTeams(eq(1L), any())).thenReturn(List.of(tpr));

        ResponseEntity<List<TrialParticipantResponse>> res = controller.assignTeams(1L, req, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testRemoveTeam() {
        ResponseEntity<Void> res = controller.removeTeam(1L, 2L, authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(trialParticipantService).removeTeam(1L, 2L);
        verify(accreditationService).ensureAccredited("test@test.com");
    }

    @Test
    void testGetEligibleTeams() {
        TeamResponse tr = mock(TeamResponse.class);
        when(trialParticipantService.getEligibleTeams(1L)).thenReturn(List.of(tr));

        ResponseEntity<List<TeamResponse>> res = controller.getEligibleTeams(1L);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void testUploadMyAccreditation() {
        MultipartFile file = mock(MultipartFile.class);
        ResponseEntity<Map<String, String>> res = controller.uploadMyAccreditation(authentication, file);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(accreditationService).uploadAccreditationForCurrentUser("test@test.com", file);
    }

    @Test
    void testDownloadMyAccreditation() {
        byte[] fileData = new byte[]{1, 2, 3};
        when(accreditationService.downloadMyAccreditation("test@test.com")).thenReturn(fileData);
        when(accreditationService.getMyAccreditationContentType("test@test.com")).thenReturn("image/jpeg");

        ResponseEntity<byte[]> res = controller.downloadMyAccreditation(authentication);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isEqualTo(fileData);
    }
}
