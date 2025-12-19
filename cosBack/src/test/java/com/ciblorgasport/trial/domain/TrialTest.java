package com.ciblorgasport.trial.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.ciblorgasport.site.domain.Site;

@DisplayName("Trial Entity Unit Tests")
class TrialTest {

    private Trial trial;
    private Site site;

    @BeforeEach
    void setUp() {
        site = new Site();
        site.setId(1L);
        site.setAdress("123 Rue Test");
        site.setLatitude(48.8566);
        site.setLongitude(2.3522);

        trial = new Trial();
        trial.setId(1L);
        trial.setName("100m Sprint");
        trial.setDescription("Sprint trial for athletes");
        trial.setRules("Standard IAAF rules apply");
        trial.setStartDate(LocalDate.of(2025, 12, 15));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.of(2025, 12, 15));
        trial.setEndHour(LocalTime.of(12, 0));
        trial.setSite(site);
        trial.setMode(TrialMode.INDIVIDUAL);
        trial.setCategoryGender(CategoryGender.MALE);
    }

    @Test
    @DisplayName("Should create trial with all attributes")
    void testCreateTrial() {
        assertNotNull(trial);
        assertEquals(1L, trial.getId());
        assertEquals("100m Sprint", trial.getName());
        assertEquals("Sprint trial for athletes", trial.getDescription());
        assertEquals("Standard IAAF rules apply", trial.getRules());
        assertEquals(LocalDate.of(2025, 12, 15), trial.getStartDate());
        assertEquals(LocalTime.of(10, 0), trial.getStartHour());
        assertEquals(LocalDate.of(2025, 12, 15), trial.getEndDate());
        assertEquals(LocalTime.of(12, 0), trial.getEndHour());
        assertEquals(site, trial.getSite());
        assertEquals(TrialMode.INDIVIDUAL, trial.getMode());
        assertEquals(CategoryGender.MALE, trial.getCategoryGender());
    }

    @Test
    @DisplayName("Should return true when trial has started - past date")
    void testHasStarted_PastDate() {
        trial.setStartDate(LocalDate.now().minusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));

        assertTrue(trial.hasStarted());
    }

    @Test
    @DisplayName("Should return true when trial has started - today but past hour")
    void testHasStarted_TodayPastHour() {
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.of(0, 0)); // Start at midnight

        assertTrue(trial.hasStarted());
    }

    @Test
    @DisplayName("Should return false when trial has not started - future date")
    void testHasNotStarted_FutureDate() {
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));

        assertFalse(trial.hasStarted());
    }

    @Test
    @DisplayName("Should return false when trial has not started - today but future hour")
    void testHasNotStarted_TodayFutureHour() {
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.of(23, 59)); // Almost end of day

        assertFalse(trial.hasStarted());
    }

    @Test
    @DisplayName("Should return true when trial has ended - past date")
    void testHasEnded_PastDate() {
        trial.setEndDate(LocalDate.now().minusDays(1));
        trial.setEndHour(LocalTime.of(18, 0));

        assertTrue(trial.hasEnded());
    }

    @Test
    @DisplayName("Should return true when trial has ended - today but past hour")
    void testHasEnded_TodayPastHour() {
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(0, 0)); // End at midnight

        assertTrue(trial.hasEnded());
    }

    @Test
    @DisplayName("Should return false when trial has not ended - future date")
    void testHasNotEnded_FutureDate() {
        trial.setEndDate(LocalDate.now().plusDays(1));
        trial.setEndHour(LocalTime.of(18, 0));

        assertFalse(trial.hasEnded());
    }

    @Test
    @DisplayName("Should return false when trial has not ended - today but future hour")
    void testHasNotEnded_TodayFutureHour() {
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(23, 59)); // Almost end of day

        assertFalse(trial.hasEnded());
    }

    @Test
    @DisplayName("Should work with TEAM mode")
    void testTeamMode() {
        trial.setMode(TrialMode.TEAM);
        assertEquals(TrialMode.TEAM, trial.getMode());
    }

    @Test
    @DisplayName("Should work with FEMALE category")
    void testFemaleCategoryGender() {
        trial.setCategoryGender(CategoryGender.FEMALE);
        assertEquals(CategoryGender.FEMALE, trial.getCategoryGender());
    }

    @Test
    @DisplayName("Should work with MIXTE category")
    void testMixteCategoryGender() {
        trial.setCategoryGender(CategoryGender.MIXTE);
        assertEquals(CategoryGender.MIXTE, trial.getCategoryGender());
    }
}
