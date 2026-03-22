package com.ciblorgasport.security.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.security.ActivationToken;
import com.ciblorgasport.security.ActivationTokenRepository;
import com.ciblorgasport.security.TokenType;
import com.ciblorgasport.security.dto.JwtAuthenticationResponse;
import com.ciblorgasport.security.dto.SignInRequest;
import com.ciblorgasport.security.dto.SignUpRequest;
import com.ciblorgasport.spectator.Spectator;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import com.ciblorgasport.volonteer.application.VolonteerImportService;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserAccountRepository userRepository;
    @Mock
    private UserAccountService userService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailService emailService;
    @Mock
    private ActivationTokenRepository activationTokenRepository;
    @Mock
    private VolonteerImportService volonteerImportService;

    @InjectMocks
    private AuthenticationService authenticationService;

    private UserAccount user;
    private ActivationToken token;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authenticationService, "appBaseUrl", "http://localhost:3000");

        user = Spectator.builder()
                .firstName("John")
                .lastName("Doe")
                .email("test@test.com")
                .password("hashedPassword")
                .build();
        user.setId(1L);

        token = ActivationToken.builder()
                .token("dummy-token")
                .type(TokenType.ACTIVATION)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();
    }

    @Test
    void signup_ShouldHashPasswordAndSaveUser() {
        SignUpRequest request = new SignUpRequest("Jean", "Dupont", "jean@test.com", "plainPassword");
        
        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword");
        when(userService.save(any())).thenAnswer(inv -> {
            UserAccount arg = inv.getArgument(0);
            return arg;
        });
        when(jwtService.generateToken(any())).thenReturn("fake-jwt-token");

        when(activationTokenRepository.save(any(ActivationToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        doNothing().when(emailService).sendActivationEmail(any(), any(), any());

        JwtAuthenticationResponse response = authenticationService.signup(request);

        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        verify(passwordEncoder).encode("plainPassword");
        verify(userService).save(argThat(u ->
                u.getPassword().equals("hashedPassword") && u.getEmail().equals("jean@test.com")
        ));

        verify(activationTokenRepository).save(any(ActivationToken.class));
        verify(emailService).sendActivationEmail(eq("jean@test.com"), any(), any());
    }

    @Test
    void signin_ShouldReturnToken_WhenCredentialsAreValid() {
        SignInRequest request = new SignInRequest("test@test.com", "password123");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("fake-jwt-token");

        JwtAuthenticationResponse response = authenticationService.signin(request);

        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void activateAccount_WhenValid_ShouldActivateAndReturnUrl() {
        user.setActive(false);
        when(activationTokenRepository.findByTokenAndType("dummy-token", TokenType.ACTIVATION))
                .thenReturn(Optional.of(token));

        String redirectUrl = authenticationService.activateAccount("dummy-token");

        assertThat(redirectUrl).isEqualTo("http://localhost:3000/login?activated=true");
        assertThat(user.isActive()).isTrue();
        assertThat(token.isUsed()).isTrue();
        verify(userRepository).save(user);
        verify(activationTokenRepository).save(token);
    }

    @Test
    void activateAccount_WhenUsed_ShouldReturnAlreadyActivatedUrl() {
        token.setUsed(true);
        when(activationTokenRepository.findByTokenAndType("dummy-token", TokenType.ACTIVATION))
                .thenReturn(Optional.of(token));

        String redirectUrl = authenticationService.activateAccount("dummy-token");

        assertThat(redirectUrl).isEqualTo("http://localhost:3000/login?activated=true&already=true");
    }

    @Test
    void activateAccount_WhenExpired_ShouldReturnExpiredUrl() {
        token.setExpiresAt(LocalDateTime.now().minusHours(1));
        when(activationTokenRepository.findByTokenAndType("dummy-token", TokenType.ACTIVATION))
                .thenReturn(Optional.of(token));

        String redirectUrl = authenticationService.activateAccount("dummy-token");

        assertThat(redirectUrl).isEqualTo("http://localhost:3000/login?activated=false&reason=token_expired");
    }

    @Test
    void forgotPassword_WhenUserActive_ShouldSendResetEmail() {
        user.setActive(true);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        String result = authenticationService.forgotPassword("test@test.com");

        assertThat(result).isNotNull();
        verify(emailService).sendPasswordResetEmail(eq("test@test.com"), eq("John"), anyString());
        verify(activationTokenRepository).save(any(ActivationToken.class));
    }

    @Test
    void forgotPassword_WhenUserInactiveAndHasValidToken_ShouldNotSendEmail() {
        user.setActive(false);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(activationTokenRepository.existsByUserAndUsedFalseAndExpiresAtAfter(eq(user), any()))
                .thenReturn(true);

        authenticationService.forgotPassword("test@test.com");

        verify(emailService, never()).sendPasswordResetEmail(any(), any(), any());
    }

    @Test
    void completeForgotPassword_WhenValid_ShouldUpdatePassword() {
        token.setType(TokenType.PASSWORD_RESET);
        
        when(activationTokenRepository.findByToken("dummy-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newPass123")).thenReturn("encodedNewPass");

        authenticationService.completeForgotPassword("dummy-token", "newPass123", "newPass123");

        assertThat(user.getPassword()).isEqualTo("encodedNewPass");
        assertThat(token.isUsed()).isTrue();
        verify(userRepository).save(user);
        verify(activationTokenRepository).save(token);
    }

    @Test
    void completeForgotPassword_WhenPasswordsMismatch_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class, () ->
            authenticationService.completeForgotPassword("dummy-token", "newPass123", "differentPass")
        );
    }
}
