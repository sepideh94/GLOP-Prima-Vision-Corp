package com.ciblorgasport.admin;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.commissionner.CommissionnerCreationService;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateCommissionnerRequest;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.user.dto.UserResponse;
import com.ciblorgasport.volonteer.application.VolonteerCreationService;
import com.ciblorgasport.volonteer.application.VolonteerImportService;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerCompetitionResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    @Autowired
    private final CommissionnerCreationService commissionnerService;

    @Autowired
    private final UserAccountService userAccountService;
    
    @Autowired
    private final VolonteerImportService volonteerImportService;
    
    @Autowired
    private final VolonteerCreationService volonteerCreationService;
    
    
    @PostMapping("/create-commissaire")
    public ResponseEntity<?> createCommissaire(@RequestBody CreateCommissionnerRequest request) {
        var created = commissionnerService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "id", created.getId(),
                        "email", created.getEmail(),
                        "role", created.getRoleName().replace("ROLE_", "")
                )
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userAccountService.getAllUsersForAdmin());
    }
    
    // ==================== Volontaires ====================

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
    	
    /**
     * Récupère la liste des volontaires d'une compétition avec leur statut.
     */
    @GetMapping("/competitions/{competitionId}/volonteers")
    public ResponseEntity<List<VolonteerCompetitionResponse>> getVolonteersByCompetition(@PathVariable Long competitionId) {
        
        List<VolonteerCompetitionResponse> volonteers = volonteerImportService.getVolonteersByCompetition(competitionId);
        return ResponseEntity.ok(volonteers);
    }
    
    @GetMapping("/events/{eventId}/volonteers")
    public ResponseEntity<List<VolonteerCompetitionResponse>> getVolonteersByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(volonteerImportService.getAllVolonteersByEvent(eventId));
    }


    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userAccountService.getUserByIdForAdmin(id));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean enabled = body != null ? body.get("enabled") : null;
        if (enabled == null) {
            return ResponseEntity.badRequest().build();
        }
        userAccountService.setUserActive(id, enabled);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id) {
        String tempPassword = userAccountService.resetUserPasswordByAdmin(id);
        return ResponseEntity.ok(Map.of(
                "message", "Mot de passe réinitialisé avec succès",
                "temporaryPassword", tempPassword
        ));
    }
}
