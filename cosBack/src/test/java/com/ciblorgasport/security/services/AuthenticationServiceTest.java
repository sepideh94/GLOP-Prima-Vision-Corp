package com.ciblorgasport.security.services;

import com.ciblorgasport.security.dto.JwtAuthenticationResponse;
import com.ciblorgasport.security.dto.SignInRequest;
import com.ciblorgasport.security.dto.SignUpRequest;
import com.ciblorgasport.spectator.domain.Spectator;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

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

    @InjectMocks
    private AuthenticationService authenticationService;

    @Test
    void signup_ShouldHashPasswordAndSaveUser() {
       
        SignUpRequest request = new SignUpRequest("Jean", "Dupont", "jean@test.com", "plainPassword");
        Spectator savedUser = Spectator.builder()
                .email("jean@test.com")
                .password("hashedPassword")
                .build();

        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword");
        when(userService.save(any())).thenReturn(savedUser);
        when(jwtService.generateToken(any())).thenReturn("fake-jwt-token");

       
        JwtAuthenticationResponse response = authenticationService.signup(request);

        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        verify(passwordEncoder).encode("plainPassword");
        verify(userService).save(argThat(user -> 
            user.getPassword().equals("hashedPassword") && user.getEmail().equals("jean@test.com")
        ));
    }
    
    @Test
    void signin_ShouldReturnToken_WhenCredentialsAreValid() {
        
    	
        SignInRequest request = new SignInRequest("jean@test.com", "password123");
        Spectator user = Spectator.builder()
                .email("jean@test.com")
                .password("hashedPassword")
                .build();

        when(userRepository.findByEmail("jean@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("fake-jwt-token");

        JwtAuthenticationResponse response = authenticationService.signin(request);

        
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
