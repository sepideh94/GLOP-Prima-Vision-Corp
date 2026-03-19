package com.ciblorgasport.trial.domain.result;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.result.input.ManualResultInputStrategy;
import com.ciblorgasport.trial.domain.result.input.ResultInputDto;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
@DisplayName("ManualResultInputStrategy Unit Tests")
class ManualResultInputStrategyTest {

    @Test
    @DisplayName("Collecte correctement les résultats depuis la saisie manuelle")
    void testCollect_Success() {
        TrialParticipant tp1 = buildParticipant(1L);
        TrialParticipant tp2 = buildParticipant(2L);
        Trial trial = buildTrial(10L);

        List<ResultInputDto> inputs = List.of(
                new ResultInputDto(1L, new BigDecimal("10.01")),
                new ResultInputDto(2L, new BigDecimal("10.05"))
        );

        ManualResultInputStrategy strategy = new ManualResultInputStrategy(
                inputs, List.of(tp1, tp2), PerformanceType.TIME);

        List<Result> results = strategy.collect(trial);

        assertEquals(2, results.size());
        assertEquals(new BigDecimal("10.01"), results.get(0).getPerformanceValue());
        assertEquals(new BigDecimal("10.05"), results.get(1).getPerformanceValue());
        assertEquals(PerformanceType.TIME, results.get(0).getPerformanceType());
        assertSame(trial, results.get(0).getTrial());
        assertSame(tp1, results.get(0).getTrialParticipant());
    }

    @Test
    @DisplayName("Participant inconnu dans les inputs → EntityNotFoundException")
    void testCollect_UnknownParticipant_Throws() {
        TrialParticipant tp1 = buildParticipant(1L);
        Trial trial = buildTrial(10L);

        List<ResultInputDto> inputs = List.of(
                new ResultInputDto(99L, new BigDecimal("10.01")) // ID inconnu
        );

        ManualResultInputStrategy strategy = new ManualResultInputStrategy(
                inputs, List.of(tp1), PerformanceType.TIME);

        assertThrows(EntityNotFoundException.class, () -> strategy.collect(trial));
    }

    @Test
    @DisplayName("Liste d'inputs vide → retourne liste vide")
    void testCollect_EmptyInputs() {
        Trial trial = buildTrial(10L);

        ManualResultInputStrategy strategy = new ManualResultInputStrategy(
                List.of(), List.of(), PerformanceType.TIME);

        List<Result> results = strategy.collect(trial);
        assertTrue(results.isEmpty());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static TrialParticipant buildParticipant(Long id) {
        TrialParticipant tp = new TrialParticipant();
        tp.setId(id);
        return tp;
    }

    private static Trial buildTrial(Long id) {
        Trial trial = new Trial();
        trial.setId(id);
        return trial;
    }
}
