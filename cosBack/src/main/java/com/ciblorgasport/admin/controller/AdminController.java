package com.ciblorgasport.admin.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.Role;
import com.ciblorgasport.user.dto.CreateUserRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	
	@Autowired
	private  UserAccountService userService;
    
	@PostMapping("/create-commissaire")
	 public ResponseEntity<?> createCommissaire(@RequestBody CreateUserRequest request) {
	        var created = userService.createUserWithRole(request, Role.COMMISSIONNER);
	        
	        return ResponseEntity.status(HttpStatus.CREATED).body(
	            Map.of(
	              "id", created.getId(),
	              "email", created.getEmail(),
	              "role", created.getRole().name()
	            )
	        );
	    }
}
