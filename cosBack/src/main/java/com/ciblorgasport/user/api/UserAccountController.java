package com.ciblorgasport.user.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.dto.ChangePasswordRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserAccountController {

	@Autowired
	private final UserAccountService userService;
	
	@PostMapping("/change-password")
	public String changePassword(
	        @RequestBody ChangePasswordRequest request,
	        Authentication authentication) {

	    String email = authentication.getName();
	    userService.changePassword(email, request.getOldPassword(), request.getNewPassword());
	    return "Mot de passe changé avec succès.";
	}
}
