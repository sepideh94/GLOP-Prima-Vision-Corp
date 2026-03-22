package com.ciblorgasport.commissionner;

import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVRecord;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.application.AthleteCreationService;
import com.ciblorgasport.athlete.application.AthleteImportService;
import com.ciblorgasport.athlete.application.AthleteService;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.dto.CompetitionAthleteResponse;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.application.CompetitionService;
import com.ciblorgasport.competition.application.ParticipationService;
import com.ciblorgasport.competition.dto.AthleteCompetitionDetailsResponse;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.ParticipantResponse;
import com.ciblorgasport.competition.dto.RefuseParticipationRequest;
import com.ciblorgasport.team.application.TeamImportService;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.dto.TeamImportResult;
import com.ciblorgasport.team.dto.TeamResponse;
import com.ciblorgasport.trial.application.TrialParticipantService;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.AssignAthletesRequest;
import com.ciblorgasport.trial.dto.AssignTeamsRequest;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.volonteer.application.VolonteerCreationService;
import com.ciblorgasport.volonteer.application.VolonteerImportService;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerCompetitionResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/commissioner")
@RequiredArgsConstructor
public class CommissionnerController {

	private final AthleteCreationService athleteCreationService;
	private final AthleteImportService athleteImportService;
	private final AthleteService athleteService;
	private final CompetitionService competitionService;
	private final ParticipationService participationService;
	private final TrialService trialService;
	private final TrialParticipantService trialParticipantService;
	private final TeamImportService teamImportService;
    private final CommissionnerAccreditationService accreditationService;

	
	
    @PostMapping("/create-athlete")
    public ResponseEntity<?> createAthlete(@Valid @RequestBody CreateUserRequest request, Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        UserAccount created = athleteCreationService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
              "id", created.getId(),
              "email", created.getEmail(),
              "role", created.getRoleName().replace("ROLE_", "")
            )
        );
    }


    /**
     * Import d'athlètes dans le contexte d'une compétition.
     * Crée les athlètes s'ils n'existent pas et les invite automatiquement à la compétition.
     */
    @PostMapping("/competitions/{competitionId}/import-athletes")
    public ResponseEntity<?> importAthletesForCompetition(
            @PathVariable("competitionId") Long competitionId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {

        accreditationService.ensureAccredited(authentication.getName());
        AthleteImportService.ImportResult result = athleteImportService.importAthletesForCompetition(file, competitionId);

        return ResponseEntity.ok(Map.of(
                "message", "Import athlètes terminé",
                "processed", result.processed(),
                "invited", result.invited(),
                "skipped", result.skipped()
        ));
    }
    
   
    // ==================== COMPETITIONS ====================

    @GetMapping("/events/{eventId}/competitions")
    public ResponseEntity<List<CompetitionResponse>> getCompetitionsByEvent(@PathVariable("eventId") Long eventId) {
        List<CompetitionResponse> competitions = competitionService.getCompetitionsByEventId(eventId);
        return ResponseEntity.ok(competitions);
    }

    // ==================== COMPETITION (SINGLE) ====================

    @GetMapping("/competitions/{competitionId}")
    public ResponseEntity<CompetitionResponse> getCompetition( @PathVariable Long competitionId) {

	    CompetitionResponse competition = competitionService.getCompetitionById(competitionId);
	
	    return ResponseEntity.ok(competition);
    }

    // ==================== ÉPREUVES (TRIALS) ====================

    @GetMapping("/competitions/{competitionId}/trials")
    public ResponseEntity<List<TrialResponse>> getTrialsByCompetition(@PathVariable("competitionId") Long competitionId) {
        List<TrialResponse> trials = trialService.getByCompetitionId(competitionId);
        return ResponseEntity.ok(trials);
    }

    @PutMapping("/trials/{id}")
    public ResponseEntity<TrialResponse> updateTrial(
            @PathVariable("id") Long id,
            @Valid @RequestBody TrialUpdateRequest request,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        TrialResponse updatedTrial = trialService.update(id, request);
        return ResponseEntity.ok(updatedTrial);
    }

    @PatchMapping("/trials/{id}/cancel")
    public ResponseEntity<TrialResponse> cancelTrial(
            @PathVariable("id") Long id,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        String userEmail = authentication.getName();
        TrialResponse cancelledTrial = trialService.cancelTrial(id, userEmail);
        return ResponseEntity.ok(cancelledTrial);
    }

    @PostMapping("/trials/{id}/athletes")
    public ResponseEntity<List<TrialParticipantResponse>> assignAthletes(
            @PathVariable("id") Long id,
            @Valid @RequestBody AssignAthletesRequest request,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        List<TrialParticipantResponse> result =
            trialParticipantService.assignAthletes(id, request.getAthleteIds());
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/trials/{id}/athletes")
    public ResponseEntity<List<TrialParticipantResponse>> getTrialAthletes(
            @PathVariable("id") Long id) {
        List<TrialParticipantResponse> result =
            trialParticipantService.getByTrialId(id);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/trials/{id}/athletes/{athleteId}")
    public ResponseEntity<Void> removeAthlete(
            @PathVariable("id") Long id,
            @PathVariable("athleteId") Long athleteId,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        trialParticipantService.removeAthlete(id, athleteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trials/{id}/eligible-athletes")
    public ResponseEntity<List<AthleteResponse>> getEligibleAthletes(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(trialParticipantService.getEligibleAthletes(id));
    }

    // ==================== ATHLETES ====================

    @GetMapping("/athletes")
    public ResponseEntity<List<AthleteResponse>> getAllAthletes() {
        List<AthleteResponse> athletes = athleteService.getAllAthletes();
        return ResponseEntity.ok(athletes);
    }

    @GetMapping("/competitions/{competitionId}/athletes")
    public ResponseEntity<List<AthleteResponse>> getAthletesByCompetition(
            @PathVariable("competitionId") Long competitionId) {
        List<AthleteResponse> athletes = athleteService.getAthletesByCompetition(competitionId);
        return ResponseEntity.ok(athletes);
    }

    @GetMapping("/athletes/{athleteId}/participations")
    public ResponseEntity<List<ParticipantResponse>> getParticipationsByAthlete(
            @PathVariable("athleteId") Long athleteId) {
        List<ParticipantResponse> participations = participationService.getParticipationsByAthlete(athleteId);
        return ResponseEntity.ok(participations);
    }

    @GetMapping("/athletes/{athleteId}/profile")
    public ResponseEntity<AthleteResponse> getAthleteProfile(@PathVariable("athleteId") Long athleteId) {
        AthleteResponse profile = athleteService.getAthleteProfile(athleteId);
        return ResponseEntity.ok(profile);
    }

    // ==================== ATHLETE DOCUMENTS VALIDATION ====================

    @GetMapping("/athletes/{athleteId}/medical-certificate")
    public ResponseEntity<byte[]> downloadAthleteMedicalCertificate(
            @PathVariable("athleteId") Long athleteId,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        byte[] data = athleteService.downloadMedicalCertificate(athleteId);
        String contentType = athleteService.getMedicalCertificateContentType(athleteId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"medical-certificate\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(data);
    }

    @GetMapping("/athletes/{athleteId}/passport")
    public ResponseEntity<byte[]> downloadAthletePassport(
            @PathVariable("athleteId") Long athleteId,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        byte[] data = athleteService.downloadPassport(athleteId);
        String contentType = athleteService.getPassportContentType(athleteId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"passport\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(data);
    }

    @PostMapping("/participations/{participationId}/validate")
    public ResponseEntity<Void> validateAthleteParticipation(
            @PathVariable("participationId") Long participationId,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        participationService.validateParticipation(participationId, true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/participations/{participationId}/refuse")
    public ResponseEntity<Void> refuseAthleteParticipation(
            @PathVariable("participationId") Long participationId,
            @Valid @RequestBody RefuseParticipationRequest request,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        participationService.validateParticipation(participationId, false, request.getRejectedDocument(), request.getReason());
        return ResponseEntity.ok().build();
    }
    
    // ==================== TEAMS ====================
    
    
    @PostMapping("/competitions/{competitionId}/import-teams")
    public ResponseEntity<TeamImportResult> importTeams(
            @PathVariable Long competitionId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        
        accreditationService.ensureAccredited(authentication.getName());
        TeamImportResult result = teamImportService.importTeamsForCompetition(file, competitionId);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/trials/{id}/assign-teams")
    public ResponseEntity<List<TrialParticipantResponse>> assignTeams(
            @PathVariable("id") Long id,
            @Valid @RequestBody AssignTeamsRequest request,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        List<TrialParticipantResponse> result =
            trialParticipantService.assignTeams(id, request.getTeamIds());
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @DeleteMapping("/trials/{id}/teams/{teamId}")
    public ResponseEntity<Void> removeTeam(
            @PathVariable("id") Long id,
            @PathVariable("teamId") Long teamId,
            Authentication authentication) {
        accreditationService.ensureAccredited(authentication.getName());
        trialParticipantService.removeTeam(id, teamId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trials/{id}/eligible-teams")
    public ResponseEntity<List<TeamResponse>> getEligibleTeams(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(trialParticipantService.getEligibleTeams(id));
    }
    
    // ==================== Updload CEN ====================

    @PostMapping(value = "/me/accreditation", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadMyAccreditation(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String email = authentication.getName();
        accreditationService.uploadAccreditationForCurrentUser(email, file);
        return ResponseEntity.ok(Map.of("message", "Document d'accréditation uploadé avec succès. En attente de validation."));
    }

    @GetMapping("/me/accreditation")
    public ResponseEntity<byte[]> downloadMyAccreditation(Authentication authentication) {
        String email = authentication.getName();
        byte[] fileData = accreditationService.downloadMyAccreditation(email);
        String contentType = accreditationService.getMyAccreditationContentType(email);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"accreditation\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileData);
    }
    
}
