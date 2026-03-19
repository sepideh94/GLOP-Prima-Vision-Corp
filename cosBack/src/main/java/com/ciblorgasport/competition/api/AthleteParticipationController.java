package com.ciblorgasport.competition.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.competition.application.ParticipationService;
import com.ciblorgasport.competition.dto.AthleteCompetitionDetailsResponse;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/athlete/competitions")
@RequiredArgsConstructor
public class AthleteParticipationController {

    private final ParticipationService participationService;
    private final TrialService trialService;

    @GetMapping
    public ResponseEntity<List<AthleteCompetitionDetailsResponse>> getMyCards(
            @AuthenticationPrincipal UserAccount user) {
        return ResponseEntity.ok(participationService.getAthleteDashboardCards(user.getId()));
    }

    @PostMapping("/{participationId}/confirm")
    public ResponseEntity<Void> confirm(
            @PathVariable Long participationId,
            @AuthenticationPrincipal UserAccount user) {
        participationService.confirmParticipation(participationId, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{competitionId}/trials")
    public ResponseEntity<List<TrialResponse>> getMyTrials(
            @PathVariable Long competitionId,
            @AuthenticationPrincipal UserAccount user) {
        return ResponseEntity.ok(trialService.getTrialsForAthlete(competitionId, user.getId()));
    }
}