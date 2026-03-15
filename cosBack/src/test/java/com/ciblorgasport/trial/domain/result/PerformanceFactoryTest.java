package com.ciblorgasport.trial.domain.result;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PerformanceFactory Unit Tests")
class PerformanceFactoryTest {

    @Test
    @DisplayName("TIME → retourne une TimePerformance")
    void testCreate_Time() {
        Performance perf = PerformanceFactory.create(PerformanceType.TIME, new BigDecimal("10.05"));

        assertInstanceOf(TimePerformance.class, perf);
        assertEquals(new BigDecimal("10.05"), perf.value());
    }

    @Test
    @DisplayName("POINTS → retourne une PointsPerformance")
    void testCreate_Points() {
        Performance perf = PerformanceFactory.create(PerformanceType.POINTS, new BigDecimal("9.75"));

        assertInstanceOf(PointsPerformance.class, perf);
        assertEquals(new BigDecimal("9.75"), perf.value());
    }

    @Test
    @DisplayName("La valeur est bien propagée dans l'objet créé")
    void testCreate_ValuePropagated() {
        BigDecimal value = new BigDecimal("42.123");
        Performance perf = PerformanceFactory.create(PerformanceType.TIME, value);

        assertEquals(value, perf.value());
    }
}
