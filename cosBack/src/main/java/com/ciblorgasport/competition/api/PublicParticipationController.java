package com.ciblorgasport.competition.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.competition.application.ParticipationService;
import com.ciblorgasport.competition.dto.InvitationDetailsResponse;
import com.ciblorgasport.competition.dto.OnboardingRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/participation")
@RequiredArgsConstructor
public class PublicParticipationController {

    private final ParticipationService participationService;

    @GetMapping("/details/{token}")
    public ResponseEntity<InvitationDetailsResponse> getDetails(@PathVariable String token) {
        return ResponseEntity.ok(participationService.getInvitationDetails(token));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirm(@RequestBody OnboardingRequest request) {
        participationService.validateOnboarding(
            request.getToken(), 
            request.getPassword(), 
            request.isCharterAccepted()
        );
        return ResponseEntity.ok().build();
    }
}