package com.ciblorgasport.user.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.ChangePasswordRequest;
import com.ciblorgasport.user.dto.CurrentUserResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserAccountController {

	@Autowired
	private final UserAccountService userService;
	
	@GetMapping("/me")
	public ResponseEntity<CurrentUserResponse> currentUser(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user)) {
			return ResponseEntity.notFound().build();
		}
		String role = user.getRoleName().replace("ROLE_", "");
		return ResponseEntity.ok(CurrentUserResponse.builder()
				.id(user.getId())
				.email(user.getEmail())
				.firstName(user.getFirstName())
				.lastName(user.getLastName())
				.role(role)
				.build());
	}

	@PostMapping("/change-password")
	public String changePassword(
	        @RequestBody ChangePasswordRequest request,
	        Authentication authentication) {

	    String email = authentication.getName();
	    userService.changePassword(email, request.getOldPassword(), request.getNewPassword());
	    return "Mot de passe changé avec succès.";
	}
}
