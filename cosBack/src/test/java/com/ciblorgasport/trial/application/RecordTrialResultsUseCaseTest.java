package com.ciblorgasport.trial.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.exception.TrialNotCompletedException;
import com.ciblorgasport.trial.domain.exception.TrialNotFoundException;
import com.ciblorgasport.trial.domain.ranking.RankingService;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.domain.result.input.ResultInputDto;
import com.ciblorgasport.trial.infrastructure.ResultRepository;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;

@ExtendWith(MockitoExtension.class)
class RecordTrialResultsUseCaseTest {

    @Mock
    private TrialRepository trialRepository;
    @Mock
    private TrialParticipantRepository trialParticipantRepository;
    @Mock
    private ResultRepository resultRepository;
    @Mock
    private RankingService rankingService;

    @InjectMocks
    private RecordTrialResultsUseCase useCase;

    private Trial trial;
    private TrialParticipant tp1;
    private TrialParticipant tp2;

    @BeforeEach
    void setUp() {
        trial = new Trial();
        trial.setId(10L);
        trial.setStartDate(LocalDate.now());
        trial.setStartHour(LocalTime.MIN);
        trial.setEndDate(LocalDate.now());
        trial.setEndHour(LocalTime.now().minusMinutes(1)); // Status COMPLETED

        tp1 = new TrialParticipant();
        tp1.setId(1L);

        tp2 = new TrialParticipant();
        tp2.setId(2L);
    }

    @Test
    void recordManual_WhenTrialNotFound_ThrowsException() {
        when(trialRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(TrialNotFoundException.class, 
            () -> useCase.recordManual(10L, List.of(), PerformanceType.TIME));
    }

    @Test
    void recordManual_WhenTrialNotCompleted_ThrowsException() {
        trial.setEndHour(LocalTime.MAX); // IN_PROGRESS
        when(trialRepository.findById(10L)).thenReturn(Optional.of(trial));

        assertThrows(TrialNotCompletedException.class, 
            () -> useCase.recordManual(10L, List.of(), PerformanceType.TIME));
    }

    @Test
    void recordManual_ShouldRankAndSave() {
        when(trialRepository.findById(10L)).thenReturn(Optional.of(trial));
        when(trialParticipantRepository.findByTrialId(10L)).thenReturn(List.of(tp1, tp2));

        ResultInputDto in1 = new ResultInputDto(1L, new BigDecimal("10.01"));
        ResultInputDto in2 = new ResultInputDto(2L, new BigDecimal("10.05"));

        Result r1 = Result.builder().build();
        Result r2 = Result.builder().build();
        when(rankingService.rank(anyList())).thenReturn(List.of(r1, r2));
        when(resultRepository.saveAll(anyList())).thenReturn(List.of(r1, r2));

        List<Result> results = useCase.recordManual(10L, List.of(in1, in2), PerformanceType.TIME);

        assertThat(results).hasSize(2);
        verify(rankingService).rank(anyList());
        verify(resultRepository).saveAll(anyList());
    }

    @Test
    void updateManual_WhenNotToday_ThrowsException() {
        trial.setEndDate(LocalDate.now().minusDays(1));
        when(trialRepository.findById(10L)).thenReturn(Optional.of(trial));

        assertThrows(IllegalStateException.class, 
            () -> useCase.updateManual(10L, List.of(), PerformanceType.TIME, "Admin"));
    }

    @Test
    void updateManual_ShouldDeleteOldAndSaveNew() {
        when(trialRepository.findById(10L)).thenReturn(Optional.of(trial));
        
        ResultInputDto in1 = new ResultInputDto(1L, new BigDecimal("10.01"));
        
        when(trialParticipantRepository.findByTrialId(10L)).thenReturn(List.of(tp1));
        Result r1 = Result.builder().build();
        when(rankingService.rank(anyList())).thenReturn(List.of(r1));
        when(resultRepository.saveAll(anyList())).thenReturn(List.of(r1));

        List<Result> results = useCase.updateManual(10L, List.of(in1), PerformanceType.TIME, "Admin");

        assertThat(results).hasSize(1);
        verify(resultRepository).deleteAllByTrialId(10L);
        verify(rankingService).rank(anyList());
        verify(resultRepository).saveAll(anyList());
    }
}
