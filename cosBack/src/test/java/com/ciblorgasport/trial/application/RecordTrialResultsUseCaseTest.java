package com.ciblorgasport.trial.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.exception.TrialNotFoundException;
import com.ciblorgasport.trial.domain.exception.TrialNotCompletedException;
import com.ciblorgasport.trial.domain.ranking.RankingService;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.domain.result.input.ResultInputDto;
import com.ciblorgasport.trial.domain.result.input.ResultInputStrategy;
import com.ciblorgasport.trial.infrastructure.ResultRepository;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecordTrialResultsUseCase Unit Tests")
class RecordTrialResultsUseCaseTest {

    @Mock private TrialRepository            trialRepository;
    @Mock private TrialParticipantRepository trialParticipantRepository;
    @Mock private ResultRepository           resultRepository;
    @Mock private RankingService             rankingService;
    @Mock private ResultInputStrategy        inputStrategy;

    @InjectMocks
    private RecordTrialResultsUseCase useCase;

    // -------------------------------------------------------------------------
    // execute() — stratégie externe (capteur...)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("execute : épreuve terminée → collecte, classe et persiste")
    void testExecute_CompletedTrial_Success() {
        Trial trial = buildCompletedTrial(1L);
        List<Result> rawResults    = List.of(buildResult("10.05"), buildResult("10.01"));
        List<Result> rankedResults = List.of(buildRankedResult("10.01", 1), buildRankedResult("10.05", 2));

        when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
        when(inputStrategy.collect(trial)).thenReturn(rawResults);
        when(rankingService.rank(rawResults)).thenReturn(rankedResults);
        when(resultRepository.saveAll(rankedResults)).thenReturn(rankedResults);

        List<Result> saved = useCase.execute(1L, inputStrategy);

        assertEquals(2, saved.size());
        assertEquals(1, saved.get(0).getRank());
        assertEquals(2, saved.get(1).getRank());
        verify(inputStrategy).collect(trial);
        verify(rankingService).rank(rawResults);
        verify(resultRepository).saveAll(rankedResults);
    }

    @Test
    @DisplayName("execute : épreuve introuvable → TrialNotFoundException")
    void testExecute_TrialNotFound_Throws() {
        when(trialRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TrialNotFoundException.class, () -> useCase.execute(99L, inputStrategy));

        verifyNoInteractions(inputStrategy, rankingService, resultRepository);
    }

    @Test
    @DisplayName("execute : épreuve non terminée → TrialNotCompletedException")
    void testExecute_TrialNotCompleted_Throws() {
        Trial upcomingTrial = buildUpcomingTrial(2L);
        when(trialRepository.findById(2L)).thenReturn(Optional.of(upcomingTrial));

        assertThrows(TrialNotCompletedException.class, () -> useCase.execute(2L, inputStrategy));

        verifyNoInteractions(inputStrategy, rankingService, resultRepository);
    }

    @Test
    @DisplayName("execute : épreuve annulée → TrialNotCompletedException")
    void testExecute_CancelledTrial_Throws() {
        Trial cancelledTrial = buildCancelledTrial(3L);
        when(trialRepository.findById(3L)).thenReturn(Optional.of(cancelledTrial));

        assertThrows(TrialNotCompletedException.class, () -> useCase.execute(3L, inputStrategy));
    }

    // -------------------------------------------------------------------------
    // recordManual()
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("recordManual : épreuve terminée → crée et persiste les résultats")
    void testRecordManual_CompletedTrial_Success() {
        Trial trial = buildCompletedTrial(1L);
        TrialParticipant tp1 = buildParticipant(10L);
        TrialParticipant tp2 = buildParticipant(20L);

        List<ResultInputDto> inputs = List.of(
                new ResultInputDto(10L, new BigDecimal("10.01")),
                new ResultInputDto(20L, new BigDecimal("10.05"))
        );
        List<Result> rankedResults = List.of(buildRankedResult("10.01", 1), buildRankedResult("10.05", 2));

        when(trialRepository.findById(1L)).thenReturn(Optional.of(trial));
        when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of(tp1, tp2));
        when(rankingService.rank(anyList())).thenReturn(rankedResults);
        when(resultRepository.saveAll(rankedResults)).thenReturn(rankedResults);

        List<Result> saved = useCase.recordManual(1L, inputs, PerformanceType.TIME);

        assertEquals(2, saved.size());
        verify(trialParticipantRepository).findByTrialId(1L);
        verify(rankingService).rank(anyList());
        verify(resultRepository).saveAll(rankedResults);
    }

    @Test
    @DisplayName("recordManual : épreuve non terminée → TrialNotCompletedException")
    void testRecordManual_TrialNotCompleted_Throws() {
        Trial upcomingTrial = buildUpcomingTrial(2L);
        when(trialRepository.findById(2L)).thenReturn(Optional.of(upcomingTrial));

        List<ResultInputDto> inputs = List.of(new ResultInputDto(10L, new BigDecimal("10.01")));

        assertThrows(TrialNotCompletedException.class,
                () -> useCase.recordManual(2L, inputs, PerformanceType.TIME));

        verifyNoInteractions(trialParticipantRepository, rankingService, resultRepository);
    }

    @Test
    @DisplayName("recordManual : épreuve introuvable → TrialNotFoundException")
    void testRecordManual_TrialNotFound_Throws() {
        when(trialRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TrialNotFoundException.class,
                () -> useCase.recordManual(99L, List.of(), PerformanceType.TIME));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Épreuve terminée : dates dans le passé. */
    private static Trial buildCompletedTrial(Long id) {
        Trial t = new Trial();
        t.setId(id);
        t.setStartDate(LocalDate.of(2020, 1, 1));
        t.setStartHour(LocalTime.of(10, 0));
        t.setEndDate(LocalDate.of(2020, 1, 1));
        t.setEndHour(LocalTime.of(12, 0));
        return t;
    }

    /** Épreuve à venir : aucune date définie. */
    private static Trial buildUpcomingTrial(Long id) {
        Trial t = new Trial();
        t.setId(id);
        return t;
    }

    /** Épreuve annulée. */
    private static Trial buildCancelledTrial(Long id) {
        Trial t = new Trial();
        t.setId(id);
        t.setCancelled(true);
        return t;
    }

    private static TrialParticipant buildParticipant(Long id) {
        TrialParticipant tp = new TrialParticipant();
        tp.setId(id);
        return tp;
    }

    private static Result buildResult(String value) {
        return Result.builder()
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal(value))
                .build();
    }

    private static Result buildRankedResult(String value, int rank) {
        return Result.builder()
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal(value))
                .rank(rank)
                .build();
    }
}
