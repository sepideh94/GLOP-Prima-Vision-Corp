package com.ciblorgasport.site.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.dto.SiteCreateRequest;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.dto.SiteUpdateRequest;
import com.ciblorgasport.site.infrastructure.SiteRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("SiteServiceImpl Unit Tests")
class SiteServiceImplTest {

    @Mock
    private SiteRepository siteRepository;

    @InjectMocks
    private SiteServiceImpl siteService;

    private Site testSite;
    private SiteCreateRequest createRequest;
    private SiteUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        testSite = new Site();
        testSite.setId(1L);
        testSite.setAdress("123 Rue de Test");
        testSite.setLatitude(48.8566);
        testSite.setLongitude(2.3522);

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
    @DisplayName("Should create site successfully")
    void testCreateSite_Success() {
        // Arrange
        when(siteRepository.save(any(Site.class))).thenReturn(testSite);

        // Act
        SiteResponse result = siteService.create(createRequest);

        // Assert
        assertNotNull(result);
        assertEquals(testSite.getId(), result.getId());
        assertEquals(testSite.getAdress(), result.getAdress());
        assertEquals(testSite.getLatitude(), result.getLatitude());
        assertEquals(testSite.getLongitude(), result.getLongitude());
        verify(siteRepository, times(1)).save(any(Site.class));
    }

    @Test
    @DisplayName("Should update site successfully")
    void testUpdateSite_Success() {
        // Arrange
        Site updatedSite = new Site();
        updatedSite.setId(1L);
        updatedSite.setAdress(updateRequest.getAdress());
        updatedSite.setLatitude(updateRequest.getLatitude());
        updatedSite.setLongitude(updateRequest.getLongitude());

        when(siteRepository.findById(1L)).thenReturn(Optional.of(testSite));
        when(siteRepository.save(any(Site.class))).thenReturn(updatedSite);

        // Act
        SiteResponse result = siteService.update(1L, updateRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(updateRequest.getAdress(), result.getAdress());
        assertEquals(updateRequest.getLatitude(), result.getLatitude());
        assertEquals(updateRequest.getLongitude(), result.getLongitude());
        verify(siteRepository, times(1)).findById(1L);
        verify(siteRepository, times(1)).save(any(Site.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent site")
    void testUpdateSite_NotFound() {
        // Arrange
        when(siteRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            siteService.update(999L, updateRequest);
        });

        assertTrue(exception.getMessage().contains("Site introuvable avec l'ID: 999"));
        verify(siteRepository, times(1)).findById(999L);
        verify(siteRepository, never()).save(any(Site.class));
    }

    @Test
    @DisplayName("Should get site by id successfully")
    void testGetSiteById_Success() {
        // Arrange
        when(siteRepository.findById(1L)).thenReturn(Optional.of(testSite));

        // Act
        SiteResponse result = siteService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testSite.getId(), result.getId());
        assertEquals(testSite.getAdress(), result.getAdress());
        assertEquals(testSite.getLatitude(), result.getLatitude());
        assertEquals(testSite.getLongitude(), result.getLongitude());
        verify(siteRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when getting non-existent site")
    void testGetSiteById_NotFound() {
        // Arrange
        when(siteRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            siteService.getById(999L);
        });

        assertTrue(exception.getMessage().contains("Site introuvable avec l'ID: 999"));
        verify(siteRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Should get all sites successfully")
    void testGetAllSites_Success() {
        // Arrange
        Site site2 = new Site();
        site2.setId(2L);
        site2.setAdress("789 Boulevard Test");
        site2.setLatitude(43.2965);
        site2.setLongitude(5.3698);

        List<Site> sites = Arrays.asList(testSite, site2);
        when(siteRepository.findAll()).thenReturn(sites);

        // Act
        List<SiteResponse> result = siteService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(testSite.getId(), result.get(0).getId());
        assertEquals(site2.getId(), result.get(1).getId());
        verify(siteRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no sites exist")
    void testGetAllSites_EmptyList() {
        // Arrange
        when(siteRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<SiteResponse> result = siteService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(siteRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should delete site successfully")
    void testDeleteSite_Success() {
        // Arrange
        when(siteRepository.existsById(1L)).thenReturn(true);
        doNothing().when(siteRepository).deleteById(1L);

        // Act
        assertDoesNotThrow(() -> siteService.delete(1L));

        // Assert
        verify(siteRepository, times(1)).existsById(1L);
        verify(siteRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent site")
    void testDeleteSite_NotFound() {
        // Arrange
        when(siteRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            siteService.delete(999L);
        });

        assertTrue(exception.getMessage().contains("Site introuvable avec l'ID: 999"));
        verify(siteRepository, times(1)).existsById(999L);
        verify(siteRepository, never()).deleteById(999L);
    }
}
