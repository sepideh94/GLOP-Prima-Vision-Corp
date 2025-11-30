package com.ciblorgasport.commissionner.api;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.athlete.application.AthleteCreationService;
import com.ciblorgasport.volonteer.application.VolonteerCreationService; // Nouveau service à importer
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/commissaire")
@RequiredArgsConstructor
public class CommissionnerController {
	
    private final AthleteCreationService athleteService; 
    private final VolonteerCreationService volontaireService; 

    @PostMapping("/create-athlete")
    public ResponseEntity<?> createAthlete(@RequestBody CreateUserRequest request) {
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
    public ResponseEntity<?> createVolonteer(@RequestBody CreateUserRequest request) {
        
        UserAccount created = volontaireService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
              "id", created.getId(),
              "email", created.getEmail(),
              "role", created.getRoleName().replace("ROLE_", "") 
            )
        );
    }
}