package com.ciblorgasport.security;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivationTokenRepository extends JpaRepository<ActivationToken, Long> {

    Optional<ActivationToken> findByToken(String token);

    Optional<ActivationToken> findByTokenAndType(String token, TokenType type);
}
