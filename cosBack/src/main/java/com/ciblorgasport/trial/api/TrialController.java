package com.ciblorgasport.trial.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.TrialParticipantService;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.TrialCreateRequest;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trials")
@RequiredArgsConstructor
public class TrialController {

    private final TrialService trialService;
    private final TrialParticipantService trialParticipantService;

    @PostMapping
    public ResponseEntity<TrialResponse> createTrial(@Valid @RequestBody TrialCreateRequest request) {
        TrialResponse newTrial = trialService.create(request);
        return new ResponseEntity<>(newTrial, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TrialResponse>> getTrials(
            @RequestParam(required = false) Long competitionId) {

        if (competitionId != null) {
            List<TrialResponse> trials = trialService.getByCompetitionId(competitionId);
            return ResponseEntity.ok(trials);
        }

        List<TrialResponse> trials = trialService.getAll();
        return ResponseEntity.ok(trials);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrialResponse> getTrialById(@PathVariable("id") Long id) {
        TrialResponse trial = trialService.getById(id);
        return ResponseEntity.ok(trial);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrialResponse> updateTrial(@PathVariable("id") Long id,
                                                      @Valid @RequestBody TrialUpdateRequest request) {
        TrialResponse updatedTrial = trialService.update(id, request);
        return ResponseEntity.ok(updatedTrial);
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<TrialParticipantResponse>> getParticipants(@PathVariable("id") Long id) {
        return ResponseEntity.ok(trialParticipantService.getByTrialId(id));
    }
}
