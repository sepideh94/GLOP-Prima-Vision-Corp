package com.ciblorgasport.trial.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.dto.TrialResponse;

import lombok.RequiredArgsConstructor;

/**
 * Controller for trial : accès admin
 */
@RestController
@RequestMapping("/api/admin/trials")
@RequiredArgsConstructor
public class AdminTrialController {

    private final TrialService trialService;

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TrialResponse> cancelTrial(@PathVariable("id") Long id, Authentication authentication) {
        String userEmail = authentication.getName();
        TrialResponse cancelledTrial = trialService.cancelTrial(id, userEmail);
        return ResponseEntity.ok(cancelledTrial);
    }
}
