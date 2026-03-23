package com.ciblorgasport.trial.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.result.PerformanceType;

class SimulatedSensorDataReaderTest {

    @Test
    void shouldGenerateTimeAndPointsData() {
        TrialParticipantRepository repository = org.mockito.Mockito.mock(TrialParticipantRepository.class);
        when(repository.findByTrialId(1L)).thenReturn(List.of(
                TrialParticipant.builder().id(10L).competitorType(CompetitorType.ATHLETE).competitorId(100L).build(),
                TrialParticipant.builder().id(20L).competitorType(CompetitorType.ATHLETE).competitorId(200L).build()
        ));
        SimulatedSensorDataReader reader = new SimulatedSensorDataReader(repository);

        var timeData = reader.readForTrial(1L);
        var pointsData = reader.readForTrial(1L, PerformanceType.POINTS);

        assertThat(timeData).hasSize(2);
        assertThat(pointsData).hasSize(2);
        assertThat(timeData.get(0).trialParticipantId()).isEqualTo(10L);
        assertThat(timeData.get(0).performanceValue().doubleValue()).isBetween(9.5, 15.0);
        assertThat(pointsData.get(0).performanceValue().doubleValue()).isBetween(1.0, 10.0);
    }
}
