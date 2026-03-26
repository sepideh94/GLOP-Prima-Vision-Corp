package com.ciblorgasport.trial.domain;

import java.time.LocalDateTime;

import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.competition.domain.CompetitorType;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trial_participant", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trial_id", "competitor_id", "competitor_type"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id", nullable = false)
    private Trial trial;

    @Column(name = "competitor_id", nullable = false)
    private Long competitorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "competitor_type", nullable = false)
    private CompetitorType competitorType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TrialParticipantStatus status = TrialParticipantStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void declareForfeit() {
        if (this.trial != null && this.trial.hasStarted()) {
            throw new BusinessValidationException("L'épreuve a déjà commencé.");
        }

        if (this.status == TrialParticipantStatus.FORFEIT) {
            throw new BusinessValidationException("Le forfait a déjà été déclaré pour cette épreuve.");
        }

        this.status = TrialParticipantStatus.FORFEIT;
        this.updatedAt = LocalDateTime.now();
    }
}