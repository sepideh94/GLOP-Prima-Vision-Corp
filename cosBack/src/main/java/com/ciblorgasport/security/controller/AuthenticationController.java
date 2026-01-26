package com.ciblorgasport.security.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.security.dto.CompleteForgotPasswordRequest;
import com.ciblorgasport.security.dto.ForgotPasswordRequest;
import com.ciblorgasport.security.dto.JwtAuthenticationResponse;
import com.ciblorgasport.security.dto.SignInRequest;
import com.ciblorgasport.security.dto.SignUpRequest;
import com.ciblorgasport.security.services.AuthenticationService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
	
	@Autowired
    private final AuthenticationService authenticationService;

    @PostMapping("/signup")
    public JwtAuthenticationResponse signup(@RequestBody SignUpRequest request) {
        return authenticationService.signup(request);
    }

    @PostMapping("/signin")
    public JwtAuthenticationResponse signin(@RequestBody SignInRequest request) {
        return authenticationService.signin(request);
    }



@GetMapping("/activate")
public void activate(@RequestParam String token, HttpServletResponse response) throws IOException {
    String redirectUrl = authenticationService.activateAccount(token);
    response.sendRedirect(redirectUrl);
}

@PostMapping("/forgot-password")
public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
    return authenticationService.forgotPassword(request.getEmail());
}

@PostMapping("/forgot-password/complete")
public String completeForgotPassword(@RequestBody CompleteForgotPasswordRequest request) {
    authenticationService.completeForgotPassword(
        request.getToken(),
        request.getNewPassword(),
        request.getConfirmNewPassword()
    );
    return "Mot de passe réinitialisé avec succès.";
}

}
