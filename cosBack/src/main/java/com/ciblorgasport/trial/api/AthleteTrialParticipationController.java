package com.ciblorgasport.trial.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.TrialParticipantService;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/athlete/trials")
@RequiredArgsConstructor
public class AthleteTrialParticipationController {

    private final TrialParticipantService trialParticipantService;

    @GetMapping
    public ResponseEntity<List<TrialParticipantResponse>> getMyTrials(
            @AuthenticationPrincipal UserAccount user) {
        return ResponseEntity.ok(trialParticipantService.getByAthleteId(user.getId()));
    }

    @PostMapping("/{trialParticipantId}/forfeit")
    public ResponseEntity<Void> declareForfeit(
            @PathVariable Long trialParticipantId,
            @AuthenticationPrincipal UserAccount user) {
        trialParticipantService.declareForfeit(trialParticipantId, user.getId());
        return ResponseEntity.ok().build();
    }
}