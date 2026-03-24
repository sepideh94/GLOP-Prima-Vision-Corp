package com.ciblorgasport.trial.domain.ranking;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.result.PerformanceType;
import com.ciblorgasport.trial.domain.result.Result;
import com.ciblorgasport.trial.domain.result.TimePerformance;

class RankingServiceTest {

    private RankingService rankingService;

    @BeforeEach
    void setUp() {
        rankingService = new RankingService();
    }

    @Test
    void rank_ShouldAssignSequentialRanks_WhenNoTies() {
        TrialParticipant tp1 = new TrialParticipant(); tp1.setId(1L);
        Result r1 = Result.builder().trialParticipant(tp1)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("10.05"))
                .build();
        TrialParticipant tp2 = new TrialParticipant(); tp2.setId(2L);
        Result r2 = Result.builder().trialParticipant(tp2)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("9.98"))
                .build();
        TrialParticipant tp3 = new TrialParticipant(); tp3.setId(3L);
        Result r3 = Result.builder().trialParticipant(tp3)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("10.15"))
                .build();

        List<Result> ranked = rankingService.rank(List.of(r1, r2, r3));

        assertThat(ranked).hasSize(3);
        
        // r2 is 9.98 -> Rank 1
        assertThat(ranked.get(0).getTrialParticipant().getId()).isEqualTo(2L);
        assertThat(ranked.get(0).getRank()).isEqualTo(1);
        assertThat(ranked.get(0).isTie()).isFalse();

        // r1 is 10.05 -> Rank 2
        assertThat(ranked.get(1).getTrialParticipant().getId()).isEqualTo(1L);
        assertThat(ranked.get(1).getRank()).isEqualTo(2);
        assertThat(ranked.get(1).isTie()).isFalse();

        // r3 is 10.15 -> Rank 3
        assertThat(ranked.get(2).getTrialParticipant().getId()).isEqualTo(3L);
        assertThat(ranked.get(2).getRank()).isEqualTo(3);
        assertThat(ranked.get(2).isTie()).isFalse();
    }

    @Test
    void rank_ShouldAssignTiedRanksAndSkipNext_WhenTiesExist() {
        TrialParticipant tp1 = new TrialParticipant(); tp1.setId(1L);
        Result r1 = Result.builder().trialParticipant(tp1)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("10.01"))
                .build();
        TrialParticipant tp2 = new TrialParticipant(); tp2.setId(2L);
        Result r2 = Result.builder().trialParticipant(tp2)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("10.01"))
                .build();
        TrialParticipant tp3 = new TrialParticipant(); tp3.setId(3L);
        Result r3 = Result.builder().trialParticipant(tp3)
                .performanceType(PerformanceType.TIME)
                .performanceValue(new BigDecimal("10.05"))
                .build();

        List<Result> ranked = rankingService.rank(List.of(r1, r2, r3));

        assertThat(ranked).hasSize(3);
        
        // 10.01 should be Tie 1
        assertThat(ranked.get(0).getRank()).isEqualTo(1);
        assertThat(ranked.get(0).isTie()).isTrue();

        assertThat(ranked.get(1).getRank()).isEqualTo(1);
        assertThat(ranked.get(1).isTie()).isTrue();

        // 10.05 should be Rank 3
        assertThat(ranked.get(2).getRank()).isEqualTo(3);
        assertThat(ranked.get(2).isTie()).isFalse(); // or true if they were tied, but not here
    }
    
    @Test
    void rank_ShouldHandleEmptyList() {
        List<Result> ranked = rankingService.rank(List.of());
        assertThat(ranked).isEmpty();
    }
}
