package com.ciblorgasport.security.controller;

import com.ciblorgasport.security.JwtAuthenticationFilter;
import com.ciblorgasport.security.dto.JwtAuthenticationResponse;
import com.ciblorgasport.security.dto.SignUpRequest;
import com.ciblorgasport.security.services.AuthenticationService;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.user.application.UserAccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false) 
public class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationService authenticationService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserAccountService userAccountService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void signup_ShouldReturnToken() throws Exception {
        SignUpRequest request = SignUpRequest.builder()
                .firstName("Jean")
                .lastName("Dupont")
                .email("jean@test.com")
                .password("password123")
                .build();

        JwtAuthenticationResponse response = JwtAuthenticationResponse.builder()
                .token("token-123")
                .role("SPECTATOR")
                .build();

        when(authenticationService.signup(any(SignUpRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-123"))
                .andExpect(jsonPath("$.role").value("SPECTATOR"));
    }
}