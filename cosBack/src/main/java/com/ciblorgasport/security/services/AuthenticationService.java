package com.ciblorgasport.security.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.security.ActivationToken;
import com.ciblorgasport.security.ActivationTokenRepository;
import com.ciblorgasport.security.dto.JwtAuthenticationResponse;
import com.ciblorgasport.security.dto.SignInRequest;
import com.ciblorgasport.security.dto.SignUpRequest;
import com.ciblorgasport.spectator.Spectator;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserAccountRepository userRepository;
    private final UserAccountService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final EmailService emailService;
    private final ActivationTokenRepository activationTokenRepository;

    @Value("${app.base-url:${APP_BASE_URL:http://localhost:3000}}")
    private String appBaseUrl;

    public JwtAuthenticationResponse signup(SignUpRequest request) {

        UserAccount user = Spectator.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user.setActive(false); 

        user = userService.save(user); 

        String token = UUID.randomUUID().toString();

        ActivationToken activationToken = ActivationToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();

        activationTokenRepository.save(activationToken);

        try {
            emailService.sendActivationEmail(user.getEmail(), user.getFirstName(), token);
        } catch (Exception e) {
            e.printStackTrace();
        }

        var jwt = jwtService.generateToken(user);
        String role = user.getRoleName().replace("ROLE_", "");
        return JwtAuthenticationResponse.builder().token(jwt).role(role).build();
    }

    public String activateAccount(String token) {
    ActivationToken at = activationTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Token invalide."));

    if (at.isUsed()) {
        return appBaseUrl + "/login?activated=true&already=true";
    }

    if (at.getExpiresAt().isBefore(LocalDateTime.now())) {
        return appBaseUrl + "/login?activated=false&reason=token_expired";
    }

    UserAccount user = at.getUser();

    if (user.isActive()) {
        return appBaseUrl + "/login?activated=true&already=true";
    }

    user.setActive(true);
    userRepository.save(user);

    at.setUsed(true);
    activationTokenRepository.save(at);

    return appBaseUrl + "/login?activated=true";
}


    public JwtAuthenticationResponse signin(SignInRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        var jwt = jwtService.generateToken(user);
        String role = user.getRoleName().replace("ROLE_", "");
        return JwtAuthenticationResponse.builder().token(jwt).role(role).build();
    }
}
