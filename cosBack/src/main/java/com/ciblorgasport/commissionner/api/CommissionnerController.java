package com.ciblorgasport.commissionner.api;

import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVRecord;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.application.CompetitionService;
import com.ciblorgasport.competition.application.ParticipationService;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.ParticipantResponse;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.volonteer.application.VolonteerCreationService;
import com.ciblorgasport.volonteer.application.VolonteerImportService;
import com.ciblorgasport.volonteer.domain.Volonteer;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/commissioner")
@RequiredArgsConstructor
public class CommissionnerController {

	private final AthleteCreationService athleteCreationService;
	private final AthleteImportService athleteImportService;
	private final AthleteService athleteService;
	private final VolonteerCreationService volontaireService;
	private final UserAccountService userAccountService;
	private final CsvImportService csvService;
	private final CompetitionService competitionService;
	private final ParticipationService participationService;
	private final TrialService trialService;
	private final VolonteerImportService volonteerImportService;
    private final VolonteerCreationService volonteerCreationService;
	
    @PostMapping("/create-athlete")
    public ResponseEntity<?> createAthlete(@Valid @RequestBody CreateUserRequest request) {
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
            @RequestParam("file") MultipartFile file) throws Exception {

        AthleteImportService.ImportResult result = athleteImportService.importAthletesForCompetition(file, competitionId);

        return ResponseEntity.ok(Map.of(
                "message", "Import athlètes terminé",
                "processed", result.processed(),
                "invited", result.invited(),
                "skipped", result.skipped()
        ));
    }
    
    
    /**
     * Importe des volontaires via un fichier CSV pour une compétition.
     */
    @PostMapping("/competitions/{competitionId}/import-volonteers")
    public ResponseEntity<VolonteerImportService.ImportResult> importVolonteers(
            @PathVariable Long competitionId,
            @RequestParam("file") MultipartFile file) throws Exception {
        
        return ResponseEntity.ok(volonteerImportService.importVolonteersForCompetition(file, competitionId));
    }

    /**
     * Création manuelle d'un volontaire.
     * Le service se chargera d'envoyer le mail d'invitation automatiquement.
     */
    @PostMapping("/competitions/{competitionId}/create-volonteer")
    public ResponseEntity<UserAccount> createVolonteerManual(
            @PathVariable Long competitionId,
            @RequestBody CreateUserRequest request) {
        
        Volonteer volonteer = (Volonteer) volonteerCreationService.createUser(request);
       
        volonteerImportService.inviteToCompetition(volonteer, competitionId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(volonteer);
    }


    // ==================== COMPETITIONS ====================

    @GetMapping("/events/{eventId}/competitions")
    public ResponseEntity<List<CompetitionResponse>> getCompetitionsByEvent(@PathVariable("eventId") Long eventId) {
        List<CompetitionResponse> competitions = competitionService.getCompetitionsByEventId(eventId);
        return ResponseEntity.ok(competitions);
    }

    // ==================== COMPETITION (SINGLE) ====================

    @GetMapping("/competitions/{competitionId}")
    public ResponseEntity<CompetitionResponse> getCompetition(
        @PathVariable Long competitionId) {

    CompetitionResponse competition =
            competitionService.getCompetitionById(competitionId);

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
            @Valid @RequestBody TrialUpdateRequest request) {
        TrialResponse updatedTrial = trialService.update(id, request);
        return ResponseEntity.ok(updatedTrial);
    }

    @PatchMapping("/trials/{id}/cancel")
    public ResponseEntity<TrialResponse> cancelTrial(
            @PathVariable("id") Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        TrialResponse cancelledTrial = trialService.cancelTrial(id, userEmail);
        return ResponseEntity.ok(cancelledTrial);
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
}
