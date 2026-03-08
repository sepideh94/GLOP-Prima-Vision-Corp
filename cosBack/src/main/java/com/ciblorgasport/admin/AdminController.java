package com.ciblorgasport.admin;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.commissionner.CommissionnerCreationService;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.dto.CreateCommissionnerRequest;
import com.ciblorgasport.user.dto.UserResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    @Autowired
    private final CommissionnerCreationService commissionnerService;

    @Autowired
    private final UserAccountService userAccountService;

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
