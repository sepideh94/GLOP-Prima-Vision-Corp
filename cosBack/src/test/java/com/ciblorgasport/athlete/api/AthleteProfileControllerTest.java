package com.ciblorgasport.athlete.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.athlete.application.AthleteService;
import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AthleteProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AthleteService athleteService;

    @Autowired
    private UserAccountRepository userAccountRepository;

    private Athlete testAthlete;

    @BeforeEach
    void setUp() {
        if (userAccountRepository.findByEmail("athlete.controller@test.com").isEmpty()) {
            testAthlete = new Athlete();
            testAthlete.setEmail("athlete.controller@test.com");
            testAthlete.setFirstName("Athlete");
            testAthlete.setLastName("Test");
            testAthlete.setPassword("password123");
            testAthlete = userAccountRepository.save(testAthlete);
        } else {
            testAthlete = (Athlete) userAccountRepository.findByEmail("athlete.controller@test.com").get();
        }
    }

    @Test
    @DisplayName("Doit retourner le profil de l'athlète")
    void getMyProfile_ShouldReturnProfile() throws Exception {
        AthleteResponse mockResponse = AthleteResponse.builder()
                .id(testAthlete.getId())
                .firstName("Athlete")
                .lastName("Test")
                .email("athlete.controller@test.com")
                .build();

        when(athleteService.getAthleteProfile(testAthlete.getId())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/athlete/profile").with(user(testAthlete)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Athlete"))
                .andExpect(jsonPath("$.email").value("athlete.controller@test.com"));
    }

    @Test
    @DisplayName("Doit mettre à jour le profil de l'athlète")
    void updateMyProfile_ShouldReturnUpdatedProfile() throws Exception {
        AthleteResponse mockResponse = AthleteResponse.builder()
                .id(testAthlete.getId())
                .firstName("UpdatedName")
                .lastName("Test")
                .email("athlete.controller@test.com")
                .build();

        when(athleteService.updateAthleteProfile(eq(testAthlete.getId()), any())).thenReturn(mockResponse);

        String jsonPayload = """
                {
                    "firstName": "UpdatedName",
                    "lastName": "Test"
                }
                """;

        mockMvc.perform(put("/api/athlete/profile").with(user(testAthlete))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("UpdatedName"));
    }

    @Test
    @DisplayName("Doit uploader le certificat médical")
    void uploadMedicalCertificate_ShouldReturnOk() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "cert.pdf", "application/pdf", "dummy content".getBytes());

        mockMvc.perform(multipart("/api/athlete/profile/medical-certificate").file(file).with(user(testAthlete)))
                .andExpect(status().isOk());
        
        verify(athleteService).uploadMedicalCertificate(eq(testAthlete.getId()), any());
    }

    @Test
    @DisplayName("Doit télécharger le certificat médical")
    void downloadMedicalCertificate_ShouldReturnFile() throws Exception {
        when(athleteService.downloadMedicalCertificate(testAthlete.getId())).thenReturn("dummy content".getBytes());
        when(athleteService.getMedicalCertificateContentType(testAthlete.getId())).thenReturn("application/pdf");

        mockMvc.perform(get("/api/athlete/profile/medical-certificate").with(user(testAthlete)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"medical-certificate\""))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"));
    }

    @Test
    @DisplayName("Doit supprimer le certificat médical")
    void deleteMedicalCertificate_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/athlete/profile/medical-certificate").with(user(testAthlete)))
                .andExpect(status().isNoContent());
        
        verify(athleteService).deleteMedicalCertificate(testAthlete.getId());
    }

    @Test
    @DisplayName("Doit uploader le passeport")
    void uploadPassport_ShouldReturnOk() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "pass.pdf", "application/pdf", "dummy content".getBytes());

        mockMvc.perform(multipart("/api/athlete/profile/passport").file(file).with(user(testAthlete)))
                .andExpect(status().isOk());
        
        verify(athleteService).uploadPassport(eq(testAthlete.getId()), any());
    }

    @Test
    @DisplayName("Doit télécharger le passeport")
    void downloadPassport_ShouldReturnFile() throws Exception {
        when(athleteService.downloadPassport(testAthlete.getId())).thenReturn("dummy content".getBytes());
        when(athleteService.getPassportContentType(testAthlete.getId())).thenReturn("application/pdf");

        mockMvc.perform(get("/api/athlete/profile/passport").with(user(testAthlete)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"passport\""))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"));
    }

    @Test
    @DisplayName("Doit supprimer le passeport")
    void deletePassport_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/athlete/profile/passport").with(user(testAthlete)))
                .andExpect(status().isNoContent());
        
        verify(athleteService).deletePassport(testAthlete.getId());
    }

    @Test
    @DisplayName("Accès non authentifié doit retourner 401 ou 403")
    void unauthenticatedAccess_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/athlete/profile"))
                .andExpect(status().isForbidden());
    }
}
