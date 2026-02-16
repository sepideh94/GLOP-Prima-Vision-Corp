package com.ciblorgasport.volonteer.application;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.ciblorgasport.security.ActivationToken;
import com.ciblorgasport.security.ActivationTokenRepository;
import com.ciblorgasport.security.TokenType;
import com.ciblorgasport.user.domain.UserAccount;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VolonteerInviteTokenService {
    private final ActivationTokenRepository activationTokenRepository;

    public String createInviteToken(UserAccount user) {
        String token = UUID.randomUUID().toString();
        ActivationToken inviteToken = ActivationToken.builder()
                .token(token)
                .type(TokenType.INVITE_VOLONTEER) 
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(24)) 
                .used(false)
                .build();
        activationTokenRepository.save(inviteToken);
        return token;
    }
}