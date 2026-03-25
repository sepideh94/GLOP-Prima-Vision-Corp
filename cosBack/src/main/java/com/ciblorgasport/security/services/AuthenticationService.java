package com.ciblorgasport.security.services;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.analytics.application.AnalyticsService;
import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.config.FrontendUrlBuilder;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.security.ActivationToken;
import com.ciblorgasport.security.ActivationTokenRepository;
import com.ciblorgasport.security.TokenType;
import com.ciblorgasport.security.dto.JwtAuthenticationResponse;
import com.ciblorgasport.security.dto.SignInRequest;
import com.ciblorgasport.security.dto.SignUpRequest;
import com.ciblorgasport.spectator.domain.Spectator;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import com.ciblorgasport.volonteer.application.VolonteerImportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserAccountRepository userRepository;
    private final UserAccountService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final VolonteerImportService volonteerImportService;

    private final EmailService emailService;
    private final ActivationTokenRepository activationTokenRepository;

    private final AnalyticsService analyticsService;
    private final FrontendUrlBuilder frontendUrlBuilder;

    private String normalizeEmail(String email) {
    	
        return email == null ? null : email.trim().toLowerCase();
    }

    public JwtAuthenticationResponse signup(SignUpRequest request) {

        UserAccount user = Spectator.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizeEmail(request.getEmail()))
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user.setActive(false); 
        user = userService.save(user); 

        String token = UUID.randomUUID().toString();

        ActivationToken activationToken = ActivationToken.builder()
                .token(token)
                .type(TokenType.ACTIVATION)
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
    	
        ActivationToken at = activationTokenRepository.findByTokenAndType(token, TokenType.ACTIVATION)
                .orElseThrow(() -> new BusinessValidationException("Token invalide."));

        if (at.isUsed()) {
            return frontendUrlBuilder.path("/login?activated=true&already=true");
        }

        if (at.getExpiresAt().isBefore(LocalDateTime.now())) {
            return frontendUrlBuilder.path("/login?activated=false&reason=token_expired");
        }

        UserAccount user = at.getUser();

        if (user.isActive()) {
            return frontendUrlBuilder.path("/login?activated=true&already=true");
        }

        user.setActive(true);
        userRepository.save(user);

        at.setUsed(true);
        activationTokenRepository.save(at);

        return frontendUrlBuilder.path("/login?activated=true");
    }

    public JwtAuthenticationResponse signin(SignInRequest request) {
    	
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        var user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new BusinessValidationException("Invalid email or password."));
        
        //log suivi des indicateurs
        analyticsService.logAction(user.getEmail(), "LOGIN", "Connexion réussie");
        
        var jwt = jwtService.generateToken(user);
        String role = user.getRoleName().replace("ROLE_", "");

        return JwtAuthenticationResponse.builder().token(jwt).role(role).userId(user.getId()).build();
    }

    public String forgotPassword(String email) {
	    String normalized = normalizeEmail(email);

	    userRepository.findByEmail(normalized).ifPresent(user -> {

	        // Compte inactif : envoyer le mail de réinitialisation seulement si
	        // tous ses tokens sont expirés (l'utilisateur n'a pas pu activer à temps)
	        if (!user.isActive()) {
	            boolean hasValidToken = activationTokenRepository
	                    .existsByUserAndUsedFalseAndExpiresAtAfter(user, LocalDateTime.now());
	            if (hasValidToken) {
	                // Le token d'invitation/activation est encore valide : l'utilisateur
	                // doit utiliser le lien déjà envoyé
	                return;
	            }
	        }

	        String token = UUID.randomUUID().toString();

	        ActivationToken resetToken = ActivationToken.builder()
	                .token(token)
	                .type(TokenType.PASSWORD_RESET)
	                .user(user)
	                .expiresAt(LocalDateTime.now().plusMinutes(30))
	                .used(false)
	                .build();

	        activationTokenRepository.save(resetToken);

	        try {
	            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
	    });

	    return "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.";
	}


    public void completeForgotPassword(String token, String newPassword, String confirmNewPassword) {

    if (!Objects.equals(newPassword, confirmNewPassword)) {
        throw new BusinessValidationException("Les deux mots de passe ne correspondent pas.");
    }

    if (newPassword == null || newPassword.length() < 8) {
        throw new BusinessValidationException("Le mot de passe doit contenir au moins 8 caractères.");
    }

    ActivationToken at = activationTokenRepository.findByToken(token)
            .orElseThrow(() -> new BusinessValidationException("Token invalide."));

    if (at.isUsed()) {
        throw new BusinessValidationException("Token déjà utilisé. Réinitialisez votre mot de passe.");
    }

    if (at.getExpiresAt().isBefore(LocalDateTime.now())) {
        throw new BusinessValidationException("Token expiré. Réinitialisez votre mot de passe.");
    }

    if (at.getType() != TokenType.PASSWORD_RESET
            && at.getType() != TokenType.INVITE_COMMISSIONNER
            && at.getType() != TokenType.INVITE_ATHLETE
            && at.getType() != TokenType.INVITE_VOLONTEER) {
        throw new BusinessValidationException("Token invalide.");
    }

    UserAccount user = at.getUser();
    user.setPassword(passwordEncoder.encode(newPassword));

    if (at.getType() == TokenType.INVITE_COMMISSIONNER || at.getType() == TokenType.INVITE_ATHLETE || at.getType() == TokenType.INVITE_VOLONTEER) {
        user.setActive(true);
        volonteerImportService.updateVolonteerAssignmentsToAccepted(user.getId());
    } else if (at.getType() == TokenType.PASSWORD_RESET && !user.isActive()) {
        // Token expiré puis réinitialisation : activer le compte après définition du mot de passe
        user.setActive(true);
    }

    userRepository.save(user);

    at.setUsed(true);
    activationTokenRepository.save(at);
}


}
