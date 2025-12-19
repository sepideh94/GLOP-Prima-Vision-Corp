package com.ciblorgasport.trial.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.core.StatusChecker;
import com.ciblorgasport.round.domain.Round;
import com.ciblorgasport.site.domain.Site;
import com.fasterxml.jackson.annotation.JsonBackReference;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trial")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trial implements StatusChecker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private TrialName trialName;

    /**
     * Optional number to differentiate multiple trials of the same type in the same round
     * Example: Heat 1, Heat 2, Heat 3 for qualification rounds
     */
    private Integer roundNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String rules;

    private LocalDate startDate;
    private LocalTime startHour;
    private LocalDate endDate;
    private LocalTime endHour;

    @Enumerated(EnumType.STRING)
    private TrialMode mode;

    @Enumerated(EnumType.STRING)
    private CategoryGender categoryGender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_competition")
    @JsonBackReference
    private Competition competition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_site")
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_round")
    private Round round;

    @Override
    public boolean hasStarted() {
        if (startDate == null || startHour == null) {
            return false;
        }
        LocalDateTime startDateTime = LocalDateTime.of(startDate, startHour);
        return LocalDateTime.now().isAfter(startDateTime) || LocalDateTime.now().isEqual(startDateTime);
    }

    @Override
    public boolean hasEnded() {
        if (endDate == null || endHour == null) {
            return false;
        }
        LocalDateTime endDateTime = LocalDateTime.of(endDate, endHour);
        return LocalDateTime.now().isAfter(endDateTime) || LocalDateTime.now().isEqual(endDateTime);
    }
}
