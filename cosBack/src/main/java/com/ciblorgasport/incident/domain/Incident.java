package com.ciblorgasport.incident.domain;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "incident")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "incident_impact_levels", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "impact_level", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<ImpactLevel> impactLevels = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.EN_COURS;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Competition competition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Trial trial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private UserAccount createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = IncidentStatus.EN_COURS;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}