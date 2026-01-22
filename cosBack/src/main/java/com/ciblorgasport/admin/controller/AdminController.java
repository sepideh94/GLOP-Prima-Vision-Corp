package com.ciblorgasport.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.commissionner.application.CommissionnerCreationService;
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
}
