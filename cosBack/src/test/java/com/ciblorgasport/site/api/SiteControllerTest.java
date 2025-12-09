package com.ciblorgasport.site.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.site.application.SiteService;
import com.ciblorgasport.site.dto.SiteCreateRequest;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.dto.SiteUpdateRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(SiteController.class)
@DisplayName("SiteController Unit Tests")
class SiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SiteService siteService;

    @Autowired
    private ObjectMapper objectMapper;

    private SiteResponse siteResponse;
    private SiteCreateRequest createRequest;
    private SiteUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        siteResponse = SiteResponse.builder()
                .id(1L)
                .adress("123 Rue de Test")
                .latitude(48.8566)
                .longitude(2.3522)
                .build();

        createRequest = new SiteCreateRequest();
        createRequest.setAdress("123 Rue de Test");
        createRequest.setLatitude(48.8566);
        createRequest.setLongitude(2.3522);

        updateRequest = new SiteUpdateRequest();
        updateRequest.setAdress("456 Avenue Modifiée");
        updateRequest.setLatitude(45.7640);
        updateRequest.setLongitude(4.8357);
    }

    @Test
    @DisplayName("POST /api/admin/sites - Should create site successfully")
    void testCreateSite_Success() throws Exception {
        // Arrange
        when(siteService.create(any(SiteCreateRequest.class))).thenReturn(siteResponse);

        // Act & Assert
        mockMvc.perform(post("/api/admin/sites")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.adress").value("123 Rue de Test"))
                .andExpect(jsonPath("$.latitude").value(48.8566))
                .andExpect(jsonPath("$.longitude").value(2.3522));

        verify(siteService, times(1)).create(any(SiteCreateRequest.class));
    }

    @Test
    @DisplayName("POST /api/admin/sites - Should return 400 when address is blank")
    void testCreateSite_BlankAddress() throws Exception {
        // Arrange
        createRequest.setAdress("");

        // Act & Assert
        mockMvc.perform(post("/api/admin/sites")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest());

        verify(siteService, never()).create(any(SiteCreateRequest.class));
    }

    @Test
    @DisplayName("PUT /api/admin/sites/{id} - Should update site successfully")
    void testUpdateSite_Success() throws Exception {
        // Arrange
        SiteResponse updatedResponse = SiteResponse.builder()
                .id(1L)
                .adress("456 Avenue Modifiée")
                .latitude(45.7640)
                .longitude(4.8357)
                .build();

        when(siteService.update(eq(1L), any(SiteUpdateRequest.class))).thenReturn(updatedResponse);

        // Act & Assert
        mockMvc.perform(put("/api/admin/sites/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.adress").value("456 Avenue Modifiée"))
                .andExpect(jsonPath("$.latitude").value(45.7640))
                .andExpect(jsonPath("$.longitude").value(4.8357));

        verify(siteService, times(1)).update(eq(1L), any(SiteUpdateRequest.class));
    }

    @Test
    @DisplayName("PUT /api/admin/sites/{id} - Should return 400 when address is blank")
    void testUpdateSite_BlankAddress() throws Exception {
        // Arrange
        updateRequest.setAdress("");

        // Act & Assert
        mockMvc.perform(put("/api/admin/sites/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest());

        verify(siteService, never()).update(eq(1L), any(SiteUpdateRequest.class));
    }

    @Test
    @DisplayName("PUT /api/admin/sites/{id} - Should return 500 when site not found")
    void testUpdateSite_NotFound() throws Exception {
        // Arrange
        when(siteService.update(eq(999L), any(SiteUpdateRequest.class)))
                .thenThrow(new RuntimeException("Site introuvable avec l'ID: 999"));

        // Act & Assert
        mockMvc.perform(put("/api/admin/sites/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isInternalServerError());

        verify(siteService, times(1)).update(eq(999L), any(SiteUpdateRequest.class));
    }

    @Test
    @DisplayName("GET /api/admin/sites/{id} - Should get site by id successfully")
    void testGetSiteById_Success() throws Exception {
        // Arrange
        when(siteService.getById(1L)).thenReturn(siteResponse);

        // Act & Assert
        mockMvc.perform(get("/api/admin/sites/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.adress").value("123 Rue de Test"))
                .andExpect(jsonPath("$.latitude").value(48.8566))
                .andExpect(jsonPath("$.longitude").value(2.3522));

        verify(siteService, times(1)).getById(1L);
    }

    @Test
    @DisplayName("GET /api/admin/sites/{id} - Should return 500 when site not found")
    void testGetSiteById_NotFound() throws Exception {
        // Arrange
        when(siteService.getById(999L))
                .thenThrow(new RuntimeException("Site introuvable avec l'ID: 999"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/sites/999"))
                .andExpect(status().isInternalServerError());

        verify(siteService, times(1)).getById(999L);
    }

    @Test
    @DisplayName("GET /api/admin/sites - Should get all sites successfully")
    void testGetAllSites_Success() throws Exception {
        // Arrange
        SiteResponse site2 = SiteResponse.builder()
                .id(2L)
                .adress("789 Boulevard Test")
                .latitude(43.2965)
                .longitude(5.3698)
                .build();

        List<SiteResponse> sites = Arrays.asList(siteResponse, site2);
        when(siteService.getAll()).thenReturn(sites);

        // Act & Assert
        mockMvc.perform(get("/api/admin/sites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].adress").value("123 Rue de Test"))
                .andExpect(jsonPath("$[1].id").value(2L))
                .andExpect(jsonPath("$[1].adress").value("789 Boulevard Test"));

        verify(siteService, times(1)).getAll();
    }

    @Test
    @DisplayName("GET /api/admin/sites - Should return empty list when no sites exist")
    void testGetAllSites_EmptyList() throws Exception {
        // Arrange
        when(siteService.getAll()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/admin/sites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(siteService, times(1)).getAll();
    }

    @Test
    @DisplayName("DELETE /api/admin/sites/{id} - Should delete site successfully")
    void testDeleteSite_Success() throws Exception {
        // Arrange
        doNothing().when(siteService).delete(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/sites/1"))
                .andExpect(status().isNoContent());

        verify(siteService, times(1)).delete(1L);
    }

    @Test
    @DisplayName("DELETE /api/admin/sites/{id} - Should return 500 when site not found")
    void testDeleteSite_NotFound() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Site introuvable avec l'ID: 999"))
                .when(siteService).delete(999L);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/sites/999"))
                .andExpect(status().isInternalServerError());

        verify(siteService, times(1)).delete(999L);
    }
}
