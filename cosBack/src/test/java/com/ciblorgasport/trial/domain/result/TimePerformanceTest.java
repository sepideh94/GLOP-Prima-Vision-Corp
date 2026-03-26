package com.ciblorgasport.trial.domain.result;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;

import com.ciblorgasport.common.exception.BusinessValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("TimePerformance Unit Tests")
class TimePerformanceTest {

    @Test
    @DisplayName("isBetterThan : temps plus court est meilleur")
    void testIsBetterThan_ShorterTimeWins() {
        TimePerformance faster = new TimePerformance(new BigDecimal("10.01"));
        TimePerformance slower = new TimePerformance(new BigDecimal("10.05"));

        assertTrue(faster.isBetterThan(slower));
        assertFalse(slower.isBetterThan(faster));
    }

    @Test
    @DisplayName("isBetterThan : performances égales → ni l'une ni l'autre n'est meilleure")
    void testIsBetterThan_EqualTimes() {
        TimePerformance a = new TimePerformance(new BigDecimal("10.01"));
        TimePerformance b = new TimePerformance(new BigDecimal("10.01"));

        assertFalse(a.isBetterThan(b));
        assertFalse(b.isBetterThan(a));
    }

    @Test
    @DisplayName("compareTo : tri croissant (plus petit en premier)")
    void testCompareTo_AscendingOrder() {
        TimePerformance faster = new TimePerformance(new BigDecimal("9.99"));
        TimePerformance slower = new TimePerformance(new BigDecimal("10.50"));

        assertTrue(faster.compareTo(slower) < 0);
        assertTrue(slower.compareTo(faster) > 0);
        assertEquals(0, faster.compareTo(new TimePerformance(new BigDecimal("9.99"))));
    }

    @Test
    @DisplayName("compareTo : type incompatible → BusinessValidationException")
    void testCompareTo_IncompatibleType_Throws() {
        TimePerformance time = new TimePerformance(new BigDecimal("10.00"));
        PointsPerformance points = new PointsPerformance(new BigDecimal("10.00"));

        assertThrows(BusinessValidationException.class, () -> time.compareTo(points));
    }

    @Test
    @DisplayName("constructeur : valeur négative → BusinessValidationException")
    void testConstructor_NegativeValue_Throws() {
        assertThrows(BusinessValidationException.class,
                () -> new TimePerformance(new BigDecimal("-1.00")));
    }

    @Test
    @DisplayName("constructeur : valeur null → BusinessValidationException")
    void testConstructor_NullValue_Throws() {
        assertThrows(BusinessValidationException.class,
                () -> new TimePerformance(null));
    }

    @Test
    @DisplayName("formatted : affiche la valeur suivie de 's'")
    void testFormatted() {
        TimePerformance perf = new TimePerformance(new BigDecimal("10.050"));
        assertEquals("10.050s", perf.formatted());
    }
}
