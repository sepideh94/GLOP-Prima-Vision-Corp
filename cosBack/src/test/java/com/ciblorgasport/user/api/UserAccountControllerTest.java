package com.ciblorgasport.user.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountService userService;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Athlete testUser;

    @BeforeEach
    void setUp() {
        if (userAccountRepository.findByEmail("user.controller@test.com").isEmpty()) {
            testUser = new Athlete();
            testUser.setEmail("user.controller@test.com");
            testUser.setFirstName("User");
            testUser.setLastName("Test");
            testUser.setPassword(passwordEncoder.encode("oldPassword123"));
            testUser = userAccountRepository.save(testUser);
        } else {
            testUser = (Athlete) userAccountRepository.findByEmail("user.controller@test.com").get();
            testUser.setPassword(passwordEncoder.encode("oldPassword123"));
            testUser = userAccountRepository.save(testUser);
        }
    }

    @Test
    @DisplayName("Devrait changer le mot de passe avec des credentials valides")
    void changePassword_WithValidData_ShouldReturnSuccess() throws Exception {
        String jsonPayload = """
                {
                    "oldPassword": "oldPassword123",
                    "newPassword": "newPassword456"
                }
                """;

        mockMvc.perform(post("/api/user/change-password").with(user(testUser))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(content().string("Mot de passe changé avec succès."));
    }

    @Test
    @DisplayName("Devrait retourner 401/403 si l'utilisateur n'est pas authentifié")
    void changePassword_Unauthenticated_ShouldReturnForbidden() throws Exception {
        String jsonPayload = """
                {
                    "oldPassword": "oldPassword123",
                    "newPassword": "newPassword456"
                }
                """;

        mockMvc.perform(post("/api/user/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isForbidden());
    }
}
