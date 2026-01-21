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
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.application.CompetitionService;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.volonteer.application.VolonteerCreationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/commissioner")
@RequiredArgsConstructor
public class CommissionnerController {

	private final AthleteCreationService athleteService;
	private final VolonteerCreationService volontaireService;
	private final UserAccountService userAccountService;
	private final CsvImportService csvService;
	private final CompetitionService competitionService;
	private final TrialService trialService;

    @PostMapping("/create-athlete")
    public ResponseEntity<?> createAthlete(@Valid @RequestBody CreateUserRequest request) {
        UserAccount created = athleteService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
              "id", created.getId(),
              "email", created.getEmail(),
              "role", created.getRoleName().replace("ROLE_", "")
            )
        );
    }

    @PostMapping("/create-volonteer")
    public ResponseEntity<?> createVolonteer(@Valid @RequestBody CreateUserRequest request) {
        UserAccount created = volontaireService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
              "id", created.getId(),
              "email", created.getEmail(),
              "role", created.getRoleName().replace("ROLE_", "")
            )
        );
    }

    @PostMapping("/import-athletes")
    public ResponseEntity<?> importAthletes(@RequestParam("file") MultipartFile file) throws Exception {
        List<CSVRecord> records = csvService.parseCsv(file);
        records.forEach(r -> userAccountService.createAndInviteUser(r, athleteService));
        return ResponseEntity.ok("Import athlètes terminé");
    }

    @PostMapping("/import-volonteers")
    public ResponseEntity<?> importVolonteers(@RequestParam("file") MultipartFile file) throws Exception {
        List<CSVRecord> records = csvService.parseCsv(file);
        records.forEach(r -> userAccountService.createAndInviteUser(r, volontaireService));
        return ResponseEntity.ok("Import volontaires terminé");
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
}
