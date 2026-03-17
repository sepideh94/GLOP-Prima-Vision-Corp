package com.ciblorgasport.security;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.user.domain.UserAccount;

public interface ActivationTokenRepository extends JpaRepository<ActivationToken, Long> {

    Optional<ActivationToken> findByToken(String token);

    Optional<ActivationToken> findByTokenAndType(String token, TokenType type);

    boolean existsByUserAndUsedFalseAndExpiresAtAfter(UserAccount user, LocalDateTime now);
}
