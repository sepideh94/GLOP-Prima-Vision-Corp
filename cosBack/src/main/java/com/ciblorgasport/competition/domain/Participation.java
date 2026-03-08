package com.ciblorgasport.competition.domain;

import java.time.LocalDateTime;
import java.util.UUID;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant la participation d'un compétiteur à une compétition.
 * Utilise un pattern polymorphique avec competitorId et competitorType
 * pour supporter différents types de participants (Athlete, Team, etc.).
 */

@Entity
@Table(name = "participation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @Column(name = "competitor_id", nullable = false)
    private Long competitorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "competitor_type", nullable = false)
    private CompetitorType competitorType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParticipationStatus status = ParticipationStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    
    @Column(name = "charter_accepted", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean charterAccepted = false;

    @Column(name = "charter_accepted_at")
    private LocalDateTime charterAcceptedAt;
    
    public void confirmCharter() {
        if (this.competition != null && this.competition.getEndDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("La compétition est terminée.");
        }
        this.charterAccepted = true;
        this.charterAcceptedAt = LocalDateTime.now();
        this.status = ParticipationStatus.CONFIRMED;
    }
    
    
    
}
