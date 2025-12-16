package com.ciblorgasport.security.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.admin.domain.Admin;
import com.ciblorgasport.config.BaseIntegrationTest;
import com.ciblorgasport.security.dto.SignInRequest;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertTrue;



@SpringBootTest
@AutoConfigureMockMvc
public class AuthenticationControllerTest extends BaseIntegrationTest{

	@Autowired
    private MockMvc mockMvc; 

    @Autowired
    private ObjectMapper objectMapper; 

    @Autowired
    private UserAccountRepository userAccountRepository; 
    
    @Autowired
    private PasswordEncoder passwordEncoder; 

    private static final String API_AUTH_PATH = "/api/auth";
    private static final String TEST_EMAIL = "admin.test@ciblorgasport.com";
    private static final String TEST_PASSWORD = "Password123!";
    
    
    @BeforeEach
    void setup() {
        userAccountRepository.deleteAll();
        Admin admin = new Admin(); 
        admin.setEmail(TEST_EMAIL);
        admin.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        admin.setFirstName("Admin");
        admin.setLastName("Test");
        
        userAccountRepository.save(admin);
    }
    
    @Test
    void testSignInSuccess() throws Exception {
        
        SignInRequest request = new SignInRequest(TEST_EMAIL, TEST_PASSWORD); 
        mockMvc.perform(post(API_AUTH_PATH + "/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()) 
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"));
    }
}
