package com.ciblorgasport.trial.domain.ranking;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.Result;

@DisplayName("RankingService Unit Tests")
class RankingServiceTest {

    private RankingService rankingService;

    @BeforeEach
    void setUp() {
        rankingService = new RankingService();
    }

    // -------------------------------------------------------------------------
    // Cas nominaux
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Classement temps : tri croissant, rangs 1-2-3")
    void testRank_TimePerformance_NoTie() {
        List<Result> results = List.of(
                buildTimeResult(3L, "10.05"),
                buildTimeResult(1L, "10.01"),
                buildTimeResult(2L, "10.03")
        );

        List<Result> ranked = rankingService.rank(results);

        assertEquals(3, ranked.size());
        assertResult(ranked.get(0), "10.01", 1, false);
        assertResult(ranked.get(1), "10.03", 2, false);
        assertResult(ranked.get(2), "10.05", 3, false);
    }

    @Test
    @DisplayName("Classement points : tri décroissant, rangs 1-2-3")
    void testRank_PointsPerformance_NoTie() {
        List<Result> results = List.of(
                buildPointsResult(1L, "8.50"),
                buildPointsResult(2L, "9.75"),
                buildPointsResult(3L, "7.00")
        );

        List<Result> ranked = rankingService.rank(results);

        assertEquals(3, ranked.size());
        assertResult(ranked.get(0), "9.75", 1, false);
        assertResult(ranked.get(1), "8.50", 2, false);
        assertResult(ranked.get(2), "7.00", 3, false);
    }

    // -------------------------------------------------------------------------
    // Ex aequo
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Ex aequo en 1ère place : rangs 1-1-3 (règle olympique)")
    void testRank_TieAtFirst_OlympicRule() {
        List<Result> results = List.of(
                buildTimeResult(1L, "10.01"),
                buildTimeResult(2L, "10.01"),
                buildTimeResult(3L, "10.05")
        );

        List<Result> ranked = rankingService.rank(results);

        assertEquals(3, ranked.size());
        assertResult(ranked.get(0), "10.01", 1, true);
        assertResult(ranked.get(1), "10.01", 1, true);
        assertResult(ranked.get(2), "10.05", 3, false);
    }

    @Test
    @DisplayName("Ex aequo en 2ème place : rangs 1-2-2-4")
    void testRank_TieAtSecond_OlympicRule() {
        List<Result> results = List.of(
                buildTimeResult(1L, "10.00"),
                buildTimeResult(2L, "10.03"),
                buildTimeResult(3L, "10.03"),
                buildTimeResult(4L, "10.07")
        );

        List<Result> ranked = rankingService.rank(results);

        assertEquals(4, ranked.size());
        assertResult(ranked.get(0), "10.00", 1, false);
        assertResult(ranked.get(1), "10.03", 2, true);
        assertResult(ranked.get(2), "10.03", 2, true);
        assertResult(ranked.get(3), "10.07", 4, false);
    }

    @Test
    @DisplayName("Tous ex aequo : tous rang 1")
    void testRank_AllTied() {
        List<Result> results = List.of(
                buildTimeResult(1L, "10.01"),
                buildTimeResult(2L, "10.01"),
                buildTimeResult(3L, "10.01")
        );

        List<Result> ranked = rankingService.rank(results);

        ranked.forEach(r -> {
            assertEquals(1, r.getRank());
            assertTrue(r.isTie());
        });
    }

    // -------------------------------------------------------------------------
    // Cas limites
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Liste vide → retourne liste vide")
    void testRank_EmptyList() {
        List<Result> ranked = rankingService.rank(List.of());
        assertTrue(ranked.isEmpty());
    }

    @Test
    @DisplayName("Un seul participant → rang 1, pas d'ex aequo")
    void testRank_SingleResult() {
        List<Result> results = List.of(buildTimeResult(1L, "10.00"));

        List<Result> ranked = rankingService.rank(results);

        assertEquals(1, ranked.size());
        assertResult(ranked.get(0), "10.00", 1, false);
    }

    @Test
    @DisplayName("L'ordre d'entrée n'influence pas le classement final")
    void testRank_InputOrderDoesNotMatter() {
        List<Result> results = List.of(
                buildTimeResult(1L, "10.50"),
                buildTimeResult(2L, "9.80"),
                buildTimeResult(3L, "10.10")
        );

        List<Result> ranked = rankingService.rank(results);

        assertEquals("9.80",  ranked.get(0).getPerformanceValue().toPlainString());
        assertEquals("10.10", ranked.get(1).getPerformanceValue().toPlainString());
        assertEquals("10.50", ranked.get(2).getPerformanceValue().toPlainString());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static Result buildTimeResult(Long id, String value) {
        return Result.builder()
                .id(id)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal(value))
                .build();
    }

    private static Result buildPointsResult(Long id, String value) {
        return Result.builder()
                .id(id)
                .performanceType(PerformanceType.POINTS)
                .performanceValue(new BigDecimal(value))
                .build();
    }

    private static void assertResult(Result result, String expectedValue, int expectedRank, boolean expectedTie) {
        assertEquals(new BigDecimal(expectedValue), result.getPerformanceValue());
        assertEquals(expectedRank, result.getRank());
        assertEquals(expectedTie, result.isTie());
    }
}
