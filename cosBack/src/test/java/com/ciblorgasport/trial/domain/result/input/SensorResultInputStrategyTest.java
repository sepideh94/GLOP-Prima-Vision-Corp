package com.ciblorgasport.trial.domain.result.input;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.result.PerformanceType;

import jakarta.persistence.EntityNotFoundException;

class SensorResultInputStrategyTest {

    @Test
    void collect_shouldBuildResultsFromSensorData() {
        SensorDataReader reader = org.mockito.Mockito.mock(SensorDataReader.class);
        Trial trial = new Trial();
        trial.setId(5L);
        TrialParticipant tp1 = TrialParticipant.builder().id(1L).competitorId(101L).competitorType(CompetitorType.ATHLETE).build();
        TrialParticipant tp2 = TrialParticipant.builder().id(2L).competitorId(102L).competitorType(CompetitorType.ATHLETE).build();
        when(reader.readForTrial(5L)).thenReturn(List.of(
                new SensorData(1L, BigDecimal.valueOf(10.12)),
                new SensorData(2L, BigDecimal.valueOf(10.45))
        ));

        SensorResultInputStrategy strategy = new SensorResultInputStrategy(reader, List.of(tp1, tp2), PerformanceType.TIME);

        var results = strategy.collect(trial);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getTrialParticipant().getId()).isEqualTo(1L);
        assertThat(results.get(0).getPerformanceType()).isEqualTo(PerformanceType.TIME);
    }

    @Test
    void collect_shouldThrowWhenParticipantMissing() {
        SensorDataReader reader = org.mockito.Mockito.mock(SensorDataReader.class);
        Trial trial = new Trial();
        trial.setId(7L);
        when(reader.readForTrial(7L)).thenReturn(List.of(new SensorData(99L, BigDecimal.ONE)));

        SensorResultInputStrategy strategy = new SensorResultInputStrategy(
                reader,
                List.of(TrialParticipant.builder().id(1L).competitorType(CompetitorType.ATHLETE).competitorId(11L).build()),
                PerformanceType.POINTS
        );

        assertThatThrownBy(() -> strategy.collect(trial))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }
}
