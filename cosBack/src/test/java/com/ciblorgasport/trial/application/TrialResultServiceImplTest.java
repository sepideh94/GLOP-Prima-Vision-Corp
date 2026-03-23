package com.ciblorgasport.trial.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
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
@DisplayName("TrialResultServiceImpl — résultats compétiteurs")
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
    
    @Nested
    @DisplayName("getCompetitorResultsByAthleteId")
    class CompetitorResults {

        @Test
        @DisplayName("aucune participation → liste vide, pas d'appel aux résultats")
        void noParticipations_returnsEmpty() {
            when(trialParticipantRepository.findAllDirectAndTeamTrialParticipations(5L))
                    .thenReturn(List.of());

            assertTrue(trialResultService.getCompetitorResultsByAthleteId(5L).isEmpty());

            verifyNoInteractions(resultRepository);
        }

        @Test
        @DisplayName("seul participant sur la série → liste vide")
        void onlySelfInTrial_returnsEmpty() {
            Trial trial = trialWithId(100L);
            TrialParticipant myTp = participant(1L, trial);

            when(trialParticipantRepository.findAllDirectAndTeamTrialParticipations(5L))
                    .thenReturn(List.of(myTp));
            when(trialParticipantRepository.findByTrialId(100L)).thenReturn(List.of(myTp));

            assertTrue(trialResultService.getCompetitorResultsByAthleteId(5L).isEmpty());

            verifyNoInteractions(resultRepository);
        }

        @Test
        @DisplayName("autre participant avec résultat → un ResultResponse mappé")
        void peerWithResult_returnsOneResponse() {
            Trial trial = trialWithId(50L);
            TrialParticipant myTp = participant(1L, trial);
            TrialParticipant otherTp = participant(2L, trial);

            Result otherResult = Result.builder()
                    .id(900L)
                    .trial(trial)
                    .trialParticipant(otherTp)
                    .performanceType(PerformanceType.TIME)
                    .performanceValue(new BigDecimal("10.02"))
                    .rank(1)
                    .tie(false)
                    .build();

            TrialParticipantResponse otherResponse = TrialParticipantResponse.builder()
                    .id(2L)
                    .trialId(50L)
                    .competitorId(88L)
                    .competitorType(CompetitorType.ATHLETE)
                    .displayName("Autre Athlète")
                    .build();

            when(trialParticipantRepository.findAllDirectAndTeamTrialParticipations(7L))
                    .thenReturn(List.of(myTp));
            when(trialParticipantRepository.findByTrialId(50L)).thenReturn(List.of(myTp, otherTp));
            when(resultRepository.findByTrialParticipantIdIn(anyList())).thenReturn(List.of(otherResult));
            when(trialParticipantRepository.findAllById(anyIterable())).thenReturn(List.of(otherTp));
            when(trialParticipantService.toResponse(otherTp)).thenReturn(otherResponse);

            var out = trialResultService.getCompetitorResultsByAthleteId(7L);

            assertEquals(1, out.size());
            assertEquals(900L, out.get(0).getId());
            assertEquals(1, out.get(0).getRank());
            assertEquals("TIME", out.get(0).getPerformanceType());
            assertEquals("Autre Athlète", out.get(0).getParticipant().getDisplayName());
            verify(trialParticipantService).toResponse(otherTp);
        }

        @Test
        @DisplayName("plusieurs épreuves : agrège les résultats des autres participants")
        void multipleTrials_aggregatesCompetitorResults() {
            Trial t1 = trialWithId(10L);
            Trial t2 = trialWithId(20L);
            TrialParticipant my1 = participant(1L, t1);
            TrialParticipant my2 = participant(2L, t2);
            TrialParticipant other1 = participant(11L, t1);
            TrialParticipant other2 = participant(22L, t2);

            Result r1 = resultFor(101L, t1, other1, "9.50", 1);
            Result r2 = resultFor(102L, t2, other2, "9.60", 2);

            when(trialParticipantRepository.findAllDirectAndTeamTrialParticipations(3L))
                    .thenReturn(List.of(my1, my2));
            when(trialParticipantRepository.findByTrialId(10L)).thenReturn(List.of(my1, other1));
            when(trialParticipantRepository.findByTrialId(20L)).thenReturn(List.of(my2, other2));
            when(resultRepository.findByTrialParticipantIdIn(anyList())).thenReturn(List.of(r1, r2));
            when(trialParticipantRepository.findAllById(anyIterable())).thenReturn(List.of(other1, other2));

            when(trialParticipantService.toResponse(other1)).thenReturn(summary(other1, "A"));
            when(trialParticipantService.toResponse(other2)).thenReturn(summary(other2, "B"));

            var out = trialResultService.getCompetitorResultsByAthleteId(3L);

            assertEquals(2, out.size());
        }

        private static Trial trialWithId(long id) {
            Trial t = new Trial();
            t.setId(id);
            return t;
        }

        private static TrialParticipant participant(long id, Trial trial) {
            return TrialParticipant.builder()
                    .id(id)
                    .trial(trial)
                    .competitorId(1000L + id)
                    .competitorType(CompetitorType.ATHLETE)
                    .build();
        }

        private static Result resultFor(long resultId, Trial trial, TrialParticipant tp, String value, int rank) {
            return Result.builder()
                    .id(resultId)
                    .trial(trial)
                    .trialParticipant(tp)
                    .performanceType(PerformanceType.TIME)
                    .performanceValue(new BigDecimal(value))
                    .rank(rank)
                    .tie(false)
                    .build();
        }

        private static TrialParticipantResponse summary(TrialParticipant tp, String label) {
            return TrialParticipantResponse.builder()
                    .id(tp.getId())
                    .trialId(tp.getTrial().getId())
                    .competitorId(tp.getCompetitorId())
                    .competitorType(CompetitorType.ATHLETE)
                    .displayName(label)
                    .build();
        }
    }
}
