package com.ciblorgasport.trial.domain.result;

import java.math.BigDecimal;

import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Résultat d'un participant pour une épreuve.
 * <p>
 * La performance est stockée en base sous forme de deux colonnes
 * ({@code performance_type} + {@code performance_value}) et reconstruite
 * en Value Object via {@link PerformanceFactory#create(PerformanceType, BigDecimal)}.
 * <p>
 * Un participant ne peut avoir qu'un seul résultat par épreuve
 * (contrainte unique sur {@code trial_participant_id}).
 */
@Entity
@Table(name = "result", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trial_participant_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id", nullable = false)
    private Trial trial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_participant_id", nullable = false)
    private TrialParticipant trialParticipant;

    @Enumerated(EnumType.STRING)
    @Column(name = "performance_type", nullable = false)
    private PerformanceType performanceType;

    @Column(name = "performance_value", nullable = false, precision = 10, scale = 3)
    private BigDecimal performanceValue;

    /** Rang calculé par {@link com.ciblorgasport.trial.domain.ranking.RankingService}. */
    @Column(nullable = false)
    private Integer rank;

    /** Indique si ce résultat est ex aequo avec au moins un autre. */
    @Column(name = "is_tie", nullable = false)
    @Builder.Default
    private boolean tie = false;

    /** Recrée le Value Object Performance à partir des colonnes persistées. */
    @Transient
    public Performance getPerformance() {
        return PerformanceFactory.create(performanceType, performanceValue);
    }
}
