package com.ciblorgasport.trial.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.dto.CompetitionResultsResponse;
import com.ciblorgasport.trial.dto.PublicCompetitionSummaryResponse;
import com.ciblorgasport.trial.dto.ResultResponse;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.infrastructure.ResultRepository;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;

@ExtendWith(MockitoExtension.class)
class TrialResultServiceImplTest {

    @Mock
    private ResultRepository resultRepository;
    @Mock
    private TrialParticipantService trialParticipantService;
    @Mock
    private TrialParticipantRepository trialParticipantRepository;
    @Mock
    private TrialRepository trialRepository;
    @Mock
    private CompetitionRepository competitionRepository;

    @InjectMocks
    private TrialResultServiceImpl trialResultService;

    @Test
    void getResultsByTrialId_ReturnsFormattedResults() {
        TrialParticipant tp = new TrialParticipant();
        tp.setId(100L);

        Result r = Result.builder()
                .trialParticipant(tp)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("9.99"))
                .rank(1)
                .build();

        TrialParticipantResponse tpr = TrialParticipantResponse.builder()
                .id(100L)
                .displayName("John Doe")
                .build();

        when(resultRepository.findByTrialIdOrderByRankAsc(1L)).thenReturn(List.of(r));
        when(trialParticipantService.getByTrialId(1L)).thenReturn(List.of(tpr));

        List<ResultResponse> results = trialResultService.getResultsByTrialId(1L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getRank()).isEqualTo(1);
        assertThat(results.get(0).getPerformance()).isEqualTo("9.99s");
    }

    @Test
    void getPublicCompetitionsWithResults_ReturnsGroupedResults() {
        Competition comp = new Competition();
        comp.setId(5L);
        comp.setName("Olympics");

        Trial trial = new Trial();
        trial.setId(1L);
        trial.setCompetition(comp);

        TrialParticipant tp = new TrialParticipant();
        tp.setId(100L);

        Result r = Result.builder()
                .trialParticipant(tp)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("9.99"))
                .rank(1)
                .build();

        TrialParticipantResponse tpr = TrialParticipantResponse.builder()
                .id(100L)
                .displayName("John Doe")
                .build();

        when(competitionRepository.findAll()).thenReturn(List.of(comp));
        when(trialRepository.findByCompetitionId(5L)).thenReturn(List.of(trial));
        
        when(resultRepository.findByTrialIdOrderByRankAsc(1L)).thenReturn(List.of(r));
        when(trialParticipantService.getByTrialId(1L)).thenReturn(List.of(tpr));

        List<PublicCompetitionSummaryResponse> summary = trialResultService.getPublicCompetitionsWithResults();

        assertThat(summary).hasSize(1);
        assertThat(summary.get(0).getCompetitionName()).isEqualTo("Olympics");
        assertThat(summary.get(0).getTrialGroups()).hasSize(1);
    }
}
