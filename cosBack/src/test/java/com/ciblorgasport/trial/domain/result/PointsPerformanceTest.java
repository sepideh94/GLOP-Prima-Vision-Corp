package com.ciblorgasport.trial.domain.result;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PointsPerformance Unit Tests")
class PointsPerformanceTest {

    @Test
    @DisplayName("isBetterThan : plus de points est meilleur")
    void testIsBetterThan_MorePointsWins() {
        PointsPerformance higher = new PointsPerformance(new BigDecimal("9.75"));
        PointsPerformance lower  = new PointsPerformance(new BigDecimal("8.50"));

        assertTrue(higher.isBetterThan(lower));
        assertFalse(lower.isBetterThan(higher));
    }

    @Test
    @DisplayName("isBetterThan : performances égales → ni l'une ni l'autre n'est meilleure")
    void testIsBetterThan_EqualPoints() {
        PointsPerformance a = new PointsPerformance(new BigDecimal("9.00"));
        PointsPerformance b = new PointsPerformance(new BigDecimal("9.00"));

        assertFalse(a.isBetterThan(b));
        assertFalse(b.isBetterThan(a));
    }

    @Test
    @DisplayName("compareTo : tri décroissant (plus grand en premier)")
    void testCompareTo_DescendingOrder() {
        PointsPerformance higher = new PointsPerformance(new BigDecimal("9.75"));
        PointsPerformance lower  = new PointsPerformance(new BigDecimal("8.50"));

        assertTrue(higher.compareTo(lower) < 0);
        assertTrue(lower.compareTo(higher) > 0);
        assertEquals(0, higher.compareTo(new PointsPerformance(new BigDecimal("9.75"))));
    }

    @Test
    @DisplayName("compareTo : type incompatible → IllegalArgumentException")
    void testCompareTo_IncompatibleType_Throws() {
        PointsPerformance points = new PointsPerformance(new BigDecimal("9.00"));
        TimePerformance   time   = new TimePerformance(new BigDecimal("9.00"));

        assertThrows(IllegalArgumentException.class, () -> points.compareTo(time));
    }

    @Test
    @DisplayName("constructeur : valeur null → IllegalArgumentException")
    void testConstructor_NullValue_Throws() {
        assertThrows(IllegalArgumentException.class,
                () -> new PointsPerformance(null));
    }

    @Test
    @DisplayName("formatted : affiche la valeur suivie de ' pts'")
    void testFormatted() {
        PointsPerformance perf = new PointsPerformance(new BigDecimal("9.750"));
        assertEquals("9.750 pts", perf.formatted());
    }
}
