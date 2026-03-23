package com.ciblorgasport.security.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        String key = Base64.getEncoder().encodeToString("01234567890123456789012345678901".getBytes());
        ReflectionTestUtils.setField(jwtService, "jwtSecretKey", key);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationsMs", 60_000L);
        user = User.withUsername("user@test.com").password("pwd").authorities("ROLE_USER").build();
    }

    @Test
    void shouldGenerateAndExtractUsername() {
        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUserName(token)).isEqualTo("user@test.com");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void shouldRejectTokenForDifferentUser() {
        String token = jwtService.generateToken(user);
        UserDetails other = User.withUsername("other@test.com").password("pwd").authorities("ROLE_USER").build();

        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    @Test
    void shouldDetectExpiredToken() throws InterruptedException {
        ReflectionTestUtils.setField(jwtService, "jwtExpirationsMs", 1L);
        String token = jwtService.generateToken(user);
        Thread.sleep(5L);

        assertThatThrownBy(() -> jwtService.isTokenValid(token, user))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }
}
