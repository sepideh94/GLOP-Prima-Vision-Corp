package com.ciblorgasport.trial.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialMode;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.dto.TrialCreateRequest;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;
import com.ciblorgasport.trial.round.infrastructure.RoundRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("TrialServiceImpl Unit Tests")
class TrialServiceImplTest {

    @Mock
    private TrialRepository trialRepository;

    @Mock
    private SiteRepository siteRepository;

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private RoundRepository roundRepository;

    @InjectMocks
    private TrialServiceImpl trialService;

    private Trial testTrial;
    private Site testSite;
    private Competition testCompetition;
    private Round testRound;
    private TrialCreateRequest createRequest;
    private TrialUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        testSite = new Site();
        testSite.setId(1L);
        testSite.setAdress("123 Rue Test");

        testCompetition = new Competition();
        testCompetition.setId(1L);
        testCompetition.setName("Test Competition");

        testCompetition.setStartDate(LocalDateTime.of(2025, 12, 1, 0, 0));
        testCompetition.setEndDate(LocalDateTime.of(2025, 12, 31, 23, 59));
        
        testRound = new Round();
        testRound.setId(1L);
        testRound.setName(RoundName.FINALE);
        

        testTrial = new Trial();
        testTrial.setId(1L);
        testTrial.setName("100m nage libre - Finale");
        testTrial.setTrialName(TrialName.HUNDRED_M_FREESTYLE);
        testTrial.setDescription("Sprint trial");
        testTrial.setRules("Standard rules");
        testTrial.setStartDate(LocalDate.of(2025, 12, 15));
        testTrial.setStartHour(LocalTime.of(10, 0));
        testTrial.setEndDate(LocalDate.of(2025, 12, 15));
        testTrial.setEndHour(LocalTime.of(12, 0));
        testTrial.setMode(TrialMode.INDIVIDUAL);
        testTrial.setCategoryGender(CategoryGender.MALE);
        testTrial.setSite(testSite);
        testTrial.setCompetition(testCompetition);
        testTrial.setRound(testRound);

        createRequest = new TrialCreateRequest();
        createRequest.setTrialName(TrialName.HUNDRED_M_FREESTYLE);
        createRequest.setDescription("Sprint trial");
        createRequest.setRules("Standard rules");
        createRequest.setStartDate(LocalDate.of(2025, 12, 15));
        createRequest.setStartHour(LocalTime.of(10, 0));
        createRequest.setEndDate(LocalDate.of(2025, 12, 15));
        createRequest.setEndHour(LocalTime.of(12, 0));
        createRequest.setMode(TrialMode.INDIVIDUAL);
        createRequest.setCategoryGender(CategoryGender.MALE);
        createRequest.setSiteId(1L);
        createRequest.setCompetitionId(1L);
        createRequest.setRoundId(1L);

        updateRequest = new TrialUpdateRequest();
        updateRequest.setTrialName(TrialName.TWO_HUNDRED_M_FREESTYLE);
        updateRequest.setDescription("Updated sprint trial");
        updateRequest.setRules("Updated rules");
        updateRequest.setStartDate(LocalDate.of(2025, 12, 16));
        updateRequest.setStartHour(LocalTime.of(14, 0));
        updateRequest.setEndDate(LocalDate.of(2025, 12, 16));
        updateRequest.setEndHour(LocalTime.of(16, 0));
        updateRequest.setMode(TrialMode.TEAM);
        updateRequest.setCategoryGender(CategoryGender.FEMALE);
        updateRequest.setSiteId(1L);
        updateRequest.setCompetitionId(1L);
        updateRequest.setRoundId(1L);
    }

    @Test
    @DisplayName("Should create trial successfully with competition and round")
    void testCreateTrial_WithCompetitionAndRound_Success() {
        
        // Mock d'une demi-finale existante terminée avant le début du nouveau trial (10h)
        Trial demiFinaleTrial = new Trial();
        demiFinaleTrial.setId(99L);
        demiFinaleTrial.setName("100m nage libre - Demi-finale");
        demiFinaleTrial.setEndDate(LocalDate.of(2025, 12, 14));
        demiFinaleTrial.setEndHour(LocalTime.of(18, 0));

        when(siteRepository.findById(1L)).thenReturn(Optional.of(testSite));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(testCompetition));
        when(roundRepository.findById(1L)).thenReturn(Optional.of(testRound));
        when(trialRepository.findActiveByCompetitionAndTrialNameAndCategoryGenderAndRoundName(
                any(), any(), any(), eq(RoundName.DEMI_FINALE)))
                .thenReturn(List.of(demiFinaleTrial));
        when(trialRepository.save(any(Trial.class))).thenReturn(testTrial);


        TrialResponse result = trialService.create(createRequest);

        
        assertNotNull(result);
        assertEquals("100m nage libre - Finale", result.getName());
        assertEquals(TrialName.HUNDRED_M_FREESTYLE, result.getTrialName());
        assertEquals(TrialMode.INDIVIDUAL, result.getMode());
        assertEquals(CategoryGender.MALE, result.getCategoryGender());
        assertEquals(1L, result.getSiteId());
        assertEquals(1L, result.getCompetitionId());
        assertEquals(1L, result.getRoundId());
        verify(siteRepository, times(1)).findById(1L);
        verify(competitionRepository, times(1)).findById(1L);
        verify(roundRepository, times(1)).findById(1L);
        verify(trialRepository, times(1)).save(any(Trial.class));
    }


    @Test
    @DisplayName("Should throw exception when creating trial with non-existent site")
    void testCreateTrial_SiteNotFound() {
        
        when(siteRepository.findById(999L)).thenReturn(Optional.empty());
        createRequest.setSiteId(999L);

        
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            trialService.create(createRequest);
        });

        assertTrue(exception.getMessage().contains("Site introuvable avec l'ID: 999"));
        verify(siteRepository, times(1)).findById(999L);
        verify(trialRepository, never()).save(any(Trial.class));
    }

    @Test
    @DisplayName("Should throw exception when creating trial with non-existent competition")
    void testCreateTrial_CompetitionNotFound() {
        
        when(siteRepository.findById(1L)).thenReturn(Optional.of(testSite));
        when(competitionRepository.findById(999L)).thenReturn(Optional.empty());
        createRequest.setCompetitionId(999L);

        
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            trialService.create(createRequest);
        });

        assertTrue(exception.getMessage().contains("Compétition introuvable avec l'ID: 999"));
        verify(competitionRepository, times(1)).findById(999L);
        verify(trialRepository, never()).save(any(Trial.class));
    }

    @Test
    @DisplayName("Should throw exception when creating trial with non-existent round")
    void testCreateTrial_RoundNotFound() {
        
        when(siteRepository.findById(1L)).thenReturn(Optional.of(testSite));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(testCompetition));
        when(roundRepository.findById(999L)).thenReturn(Optional.empty());
        createRequest.setRoundId(999L);

        
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            trialService.create(createRequest);
        });

        assertTrue(exception.getMessage().contains("Round introuvable avec l'ID: 999"));
        verify(roundRepository, times(1)).findById(999L);
        verify(trialRepository, never()).save(any(Trial.class));
    }

    @Test
    @DisplayName("Should update trial successfully")
    void testUpdateTrial_Success() {
        
        Trial updatedTrial = new Trial();
        updatedTrial.setId(1L);
        updatedTrial.setName("200m nage libre - Finale");
        updatedTrial.setTrialName(TrialName.TWO_HUNDRED_M_FREESTYLE);
        updatedTrial.setMode(TrialMode.TEAM);
        updatedTrial.setCategoryGender(CategoryGender.FEMALE);
        updatedTrial.setSite(testSite);
        updatedTrial.setCompetition(testCompetition);
        updatedTrial.setRound(testRound);

        when(trialRepository.findById(1L)).thenReturn(Optional.of(testTrial));
        when(siteRepository.findById(1L)).thenReturn(Optional.of(testSite));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(testCompetition));
        when(roundRepository.findById(1L)).thenReturn(Optional.of(testRound));
        when(trialRepository.save(any(Trial.class))).thenReturn(updatedTrial);

        
        TrialResponse result = trialService.update(1L, updateRequest);

       
        assertNotNull(result);
        assertEquals("200m nage libre - Finale", result.getName());
        assertEquals(TrialName.TWO_HUNDRED_M_FREESTYLE, result.getTrialName());
        assertEquals(TrialMode.TEAM, result.getMode());
        assertEquals(CategoryGender.FEMALE, result.getCategoryGender());
        verify(trialRepository, times(1)).findById(1L);
        verify(roundRepository, times(1)).findById(1L);
        verify(trialRepository, times(1)).save(any(Trial.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent trial")
    void testUpdateTrial_NotFound() {
        
        when(trialRepository.findById(999L)).thenReturn(Optional.empty());

        
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            trialService.update(999L, updateRequest);
        });

        assertTrue(exception.getMessage().contains("Épreuve introuvable avec l'ID: 999"));
        verify(trialRepository, times(1)).findById(999L);
        verify(trialRepository, never()).save(any(Trial.class));
    }

    @Test
    @DisplayName("Should get trial by id successfully")
    void testGetTrialById_Success() {
        
        when(trialRepository.findOneWithAssociationsById(1L)).thenReturn(Optional.of(testTrial));

        
        TrialResponse result = trialService.getById(1L);

        
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("100m nage libre - Finale", result.getName());
        assertEquals(TrialName.HUNDRED_M_FREESTYLE, result.getTrialName());
        verify(trialRepository, times(1)).findOneWithAssociationsById(1L);
    }

    @Test
    @DisplayName("Should throw exception when getting non-existent trial")
    void testGetTrialById_NotFound() {
        
        when(trialRepository.findOneWithAssociationsById(999L)).thenReturn(Optional.empty());

        
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> trialService.getById(999L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Épreuve introuvable avec l'ID: 999"));
        verify(trialRepository, times(1)).findOneWithAssociationsById(999L);
    }

    @Test
    @DisplayName("Should get all trials successfully")
    void testGetAllTrials_Success() {
        
        Trial trial2 = new Trial();
        trial2.setId(2L);
        trial2.setName("200m Sprint");
        trial2.setSite(testSite);

        List<Trial> trials = Arrays.asList(testTrial, trial2);
        when(trialRepository.findAllWithAssociations()).thenReturn(trials);

        
        List<TrialResponse> result = trialService.getAll();

        
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("100m nage libre - Finale", result.get(0).getName());
        assertEquals("200m Sprint", result.get(1).getName());
        verify(trialRepository, times(1)).findAllWithAssociations();
    }

    @Test
    @DisplayName("Should return empty list when no trials exist")
    void testGetAllTrials_EmptyList() {
        
        when(trialRepository.findAllWithAssociations()).thenReturn(Arrays.asList());

        
        List<TrialResponse> result = trialService.getAll();

        
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(trialRepository, times(1)).findAllWithAssociations();
    }

    @Test
    @DisplayName("Should delete trial successfully")
    void testDeleteTrial_Success() {
        
        when(trialRepository.existsById(1L)).thenReturn(true);
        doNothing().when(trialRepository).deleteById(1L);

        
        assertDoesNotThrow(() -> trialService.delete(1L));

        
        verify(trialRepository, times(1)).existsById(1L);
        verify(trialRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent trial")
    void testDeleteTrial_NotFound() {

    	when(trialRepository.existsById(999L)).thenReturn(false);

        
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            trialService.delete(999L);
        });

        assertTrue(exception.getMessage().contains("Épreuve introuvable avec l'ID: 999"));
        verify(trialRepository, times(1)).existsById(999L);
        verify(trialRepository, never()).deleteById(999L);
    }
}
