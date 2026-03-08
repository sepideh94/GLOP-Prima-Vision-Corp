package com.ciblorgasport.commissionner;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.security.ActivationToken;
import com.ciblorgasport.security.ActivationTokenRepository;
import com.ciblorgasport.security.TokenType;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateCommissionnerRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommissionnerCreationService {

    private final UserAccountService userService;
    private final PasswordEncoder passwordEncoder;
    private final ActivationTokenRepository activationTokenRepository;
    private final EmailService emailService;

    public UserAccount createUser(CreateCommissionnerRequest request) {

        String tempPassword = UUID.randomUUID().toString();

        Commissionner newCommissaire = Commissionner.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .build();

        newCommissaire.setActive(false);

        UserAccount saved = userService.save(newCommissaire);

        String token = UUID.randomUUID().toString();

        ActivationToken inviteToken = ActivationToken.builder()
                .token(token)
                .type(TokenType.INVITE_COMMISSIONNER)
                .user(saved)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();

        activationTokenRepository.save(inviteToken);

        emailService.sendCommissionnerInviteEmail(saved.getEmail(), saved.getFirstName(), token);

        return saved;
    }
}
