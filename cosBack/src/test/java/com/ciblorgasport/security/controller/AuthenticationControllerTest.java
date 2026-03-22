package com.ciblorgasport.security.controller;

import com.ciblorgasport.security.JwtAuthenticationFilter;
import com.ciblorgasport.security.dto.CompleteForgotPasswordRequest;
import com.ciblorgasport.security.dto.ForgotPasswordRequest;
import com.ciblorgasport.security.dto.JwtAuthenticationResponse;
import com.ciblorgasport.security.dto.SignInRequest;
import com.ciblorgasport.security.dto.SignUpRequest;
import com.ciblorgasport.security.services.AuthenticationService;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.user.application.UserAccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthenticationService authenticationService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private UserAccountService userAccountService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
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

    @Test
    void signin_ShouldReturnToken() throws Exception {
        SignInRequest request = new SignInRequest("jean@test.com", "password123");

        JwtAuthenticationResponse response = JwtAuthenticationResponse.builder()
                .token("token-xyz")
                .role("SPECTATOR")
                .build();

        when(authenticationService.signin(any(SignInRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-xyz"))
                .andExpect(jsonPath("$.role").value("SPECTATOR"));
    }

    @Test
    void activate_ShouldRedirect() throws Exception {
        when(authenticationService.activateAccount(anyString())).thenReturn("http://localhost:3000/login?activated=true");

        mockMvc.perform(get("/api/auth/activate")
                .param("token", "dummy-token"))
                .andExpect(status().isFound())
                .andExpect(redirectedUrl("http://localhost:3000/login?activated=true"));
    }

    @Test
    void forgotPassword_ShouldReturnMessage() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@test.com");

        when(authenticationService.forgotPassword("test@test.com")).thenReturn("Message from service");

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Message from service"));
    }

    @Test
    void completeForgotPassword_ShouldReturnSuccessMessage() throws Exception {
        CompleteForgotPasswordRequest request = new CompleteForgotPasswordRequest();
        request.setToken("dummy-token");
        request.setNewPassword("newPass123");
        request.setConfirmNewPassword("newPass123");

        mockMvc.perform(post("/api/auth/forgot-password/complete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Mot de passe réinitialisé avec succès."));
    }
}