package com.ciblorgasport.trial.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.ciblorgasport.admin.Admin;
import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.common.model.Status;
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
        trial.setEndHour(LocalTime.of(0, 0));

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
        trial.setEndHour(LocalTime.of(23, 59));

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

    //  TrialName Tests 

    @Test
    @DisplayName("Should set and get trialName")
    void testTrialName() {
        trial.setTrialName(TrialName.HUNDRED_M_FREESTYLE);
        assertEquals(TrialName.HUNDRED_M_FREESTYLE, trial.getTrialName());
    }

    @Test
    @DisplayName("Should work with different trialName values")
    void testDifferentTrialNames() {
        trial.setTrialName(TrialName.RELAY_4X100M_FREESTYLE);
        assertEquals(TrialName.RELAY_4X100M_FREESTYLE, trial.getTrialName());

        trial.setTrialName(TrialName.TWO_HUNDRED_M_BUTTERFLY);
        assertEquals(TrialName.TWO_HUNDRED_M_BUTTERFLY, trial.getTrialName());
    }

    //  RoundNumber Tests 

    @Test
    @DisplayName("Should set and get roundNumber")
    void testRoundNumber() {
        trial.setRoundNumber(1);
        assertEquals(1, trial.getRoundNumber());
    }

    @Test
    @DisplayName("Should handle multiple heats with roundNumber")
    void testMultipleHeats() {
        trial.setTrialName(TrialName.HUNDRED_M_FREESTYLE);
        trial.setRoundNumber(3); // Heat 3

        assertEquals(TrialName.HUNDRED_M_FREESTYLE, trial.getTrialName());
        assertEquals(3, trial.getRoundNumber());
    }

    //  Cancellation Tests 

    @Test
    @DisplayName("Should not be cancelled by default")
    void testNotCancelledByDefault() {
        assertFalse(trial.isCancelled());
        assertNull(trial.getCancelledAt());
        assertNull(trial.getCancelledBy());
    }

    @Test
    @DisplayName("Should cancel trial with user")
    void testCancelTrial() {
        // Set trial as upcoming to allow cancellation
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().plusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));

        Admin admin = Admin.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("Test")
                .password("password")
                .build();

        trial.cancel(admin);

        assertTrue(trial.isCancelled());
        assertNotNull(trial.getCancelledAt());
        assertEquals(admin, trial.getCancelledBy());
    }

    @Test
    @DisplayName("Should record cancellation timestamp")
    void testCancellationTimestamp() {
        // Set trial as in progress to allow cancellation
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.of(0, 0));
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(23, 59));

        Admin admin = Admin.builder()
                .id(2L)
                .email("admin2@test.com")
                .firstName("Admin")
                .lastName("Two")
                .password("password")
                .build();

        LocalDateTime beforeCancel = LocalDateTime.now();
        trial.cancel(admin);
        LocalDateTime afterCancel = LocalDateTime.now();

        assertNotNull(trial.getCancelledAt());
        assertFalse(trial.getCancelledAt().isBefore(beforeCancel));
        assertFalse(trial.getCancelledAt().isAfter(afterCancel));
    }

    @Test
    @DisplayName("Should allow cancellation of UPCOMING trial")
    void testCancelUpcomingTrial() {
        // Set trial as upcoming
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().plusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));

        assertEquals(Status.UPCOMING, trial.getStatus());

        Admin admin = Admin.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("Test")
                .password("password")
                .build();

        // Should not throw exception
        trial.cancel(admin);
        assertTrue(trial.isCancelled());
        assertEquals(Status.CANCELED, trial.getStatus());
    }

    @Test
    @DisplayName("Should allow cancellation of IN_PROGRESS trial")
    void testCancelInProgressTrial() {
        // Set trial as in progress
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.of(0, 0));
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(23, 59));

        assertEquals(Status.IN_PROGRESS, trial.getStatus());

        Admin admin = Admin.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("Test")
                .password("password")
                .build();

        // Should not throw exception
        trial.cancel(admin);
        assertTrue(trial.isCancelled());
        assertEquals(Status.CANCELED, trial.getStatus());
    }

    @Test
    @DisplayName("Should throw exception when cancelling COMPLETED trial")
    void testCannotCancelCompletedTrial() {
        // Set trial as completed
        trial.setStartDate(LocalDate.now().minusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().minusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));

        assertEquals(Status.COMPLETED, trial.getStatus());

        Admin admin = Admin.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("Test")
                .password("password")
                .build();

        // Should throw BusinessValidationException
        BusinessValidationException exception = assertThrows(BusinessValidationException.class, () -> {
            trial.cancel(admin);
        });

        assertEquals("Impossible d'annuler un trial terminé.", exception.getMessage());
        assertFalse(trial.isCancelled());
    }

    @Test
    @DisplayName("Should throw exception when cancelling already CANCELED trial")
    void testCannotCancelAlreadyCanceledTrial() {
        // Set trial as upcoming first
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().plusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));

        Admin admin = Admin.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("Test")
                .password("password")
                .build();

        // Cancel it first time
        trial.cancel(admin);
        assertTrue(trial.isCancelled());

        // Try to cancel again - should throw BusinessValidationException
        BusinessValidationException exception = assertThrows(BusinessValidationException.class, () -> {
            trial.cancel(admin);
        });

        assertEquals("Ce trial est déjà annulé.", exception.getMessage());
    }

    //  Status Tests 

    @Test
    @DisplayName("Should return CANCELED status when trial is cancelled")
    void testStatusCanceled() {
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().plusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));

        Admin admin = Admin.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("Test")
                .password("password")
                .build();
        trial.cancel(admin);

        assertEquals(Status.CANCELED, trial.getStatus());
    }

    @Test
    @DisplayName("Should return UPCOMING status when dates are null")
    void testStatusUpcomingWhenDatesNull() {
        trial.setStartDate(null);
        trial.setStartHour(null);
        trial.setEndDate(null);
        trial.setEndHour(null);

        assertEquals(Status.UPCOMING, trial.getStatus());
    }

    @Test
    @DisplayName("Should return UPCOMING status when trial has not started")
    void testStatusUpcomingWhenNotStarted() {
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().plusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));

        assertEquals(Status.UPCOMING, trial.getStatus());
    }

    @Test
    @DisplayName("Should return IN_PROGRESS status when trial is ongoing")
    void testStatusInProgress() {
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.of(0, 0)); // Started at midnight
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(23, 59)); // Ends at end of day

        assertEquals(Status.IN_PROGRESS, trial.getStatus());
    }

    @Test
    @DisplayName("Should return COMPLETED status when trial has ended")
    void testStatusCompleted() {
        trial.setStartDate(LocalDate.now().minusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().minusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));

        assertEquals(Status.COMPLETED, trial.getStatus());
    }

    @Test
    @DisplayName("Should return COMPLETED status when trial ends exactly now")
    void testStatusCompletedAtEndTime() {
        trial.setStartDate(LocalDate.now().minusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(0, 0)); // Ended at midnight

        assertEquals(Status.COMPLETED, trial.getStatus());
    }

    @Test
    @DisplayName("Cancelled status takes priority over time-based status")
    void testCancelledStatusPriority() {
        // Set trial as in progress
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.of(0, 0));
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(23, 59));

        // Verify it's in progress before cancellation
        assertEquals(Status.IN_PROGRESS, trial.getStatus());

        // Cancel it
        Admin admin = Admin.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("Test")
                .password("password")
                .build();
        trial.cancel(admin);

        // Status should now be CANCELED regardless of time
        assertEquals(Status.CANCELED, trial.getStatus());
    }

    @Test
    @DisplayName("Should handle complete trial lifecycle status transitions")
    void testTrialLifecycleStatuses() {
        // Future trial - UPCOMING
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().plusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));
        assertEquals(Status.UPCOMING, trial.getStatus());

        // Current trial - IN_PROGRESS
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.of(0, 0));
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.of(23, 59));
        assertEquals(Status.IN_PROGRESS, trial.getStatus());

        // Past trial - COMPLETED
        trial.setStartDate(LocalDate.now().minusDays(1));
        trial.setStartHour(LocalTime.of(10, 0));
        trial.setEndDate(LocalDate.now().minusDays(1));
        trial.setEndHour(LocalTime.of(12, 0));
        assertEquals(Status.COMPLETED, trial.getStatus());
    }
}
