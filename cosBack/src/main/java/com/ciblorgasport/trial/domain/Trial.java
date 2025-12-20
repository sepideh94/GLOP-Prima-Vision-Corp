package com.ciblorgasport.trial.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.core.Status;
import com.ciblorgasport.core.StatusChecker;
import com.ciblorgasport.round.domain.Round;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.user.domain.UserAccount;
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

    /**
     * Indicates whether this trial has been cancelled.
     * Once cancelled, the trial cannot be reactivated.
     */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean cancelled = false;

    /**
     * Timestamp when the trial was cancelled.
     * Null if not cancelled.
     */
    private LocalDateTime cancelledAt;

    /**
     * User who cancelled the trial (Admin or Commissioner).
     * Null if not cancelled.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private UserAccount cancelledBy;

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
        LocalDateTime now = LocalDateTime.now();
        return !now.isBefore(startDateTime);
    }

    @Override
    public boolean hasEnded() {
        if (endDate == null || endHour == null) {
            return false;
        }
        LocalDateTime endDateTime = LocalDateTime.of(endDate, endHour);
        LocalDateTime now = LocalDateTime.now();
        return !now.isBefore(endDateTime);
    }

    /**
     * Determines the current status of this trial.
     * Status is calculated dynamically based on:
     * - Whether it has been cancelled
     * - Start date/time and end date/time compared to current time
     *
     * @return The current status of the trial
     */
    public Status getStatus() {
        // Cancelled status takes priority
        if (cancelled) {
            return Status.CANCELED;
        }

        // Check if dates/times are set
        if (startDate == null || startHour == null || endDate == null || endHour == null) {
            return Status.UPCOMING;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDateTime = LocalDateTime.of(startDate, startHour);
        LocalDateTime endDateTime = LocalDateTime.of(endDate, endHour);

        // Check if trial hasn't started yet
        if (now.isBefore(startDateTime)) {
            return Status.UPCOMING;
        }

        // Check if trial has ended
        if (now.isAfter(endDateTime) || now.isEqual(endDateTime)) {
            return Status.COMPLETED;
        }

        // Trial is between start and end times
        return Status.IN_PROGRESS;
    }

    /**
     * Marks this trial as cancelled by the specified user.
     * This operation is permanent and cannot be undone.
     * Only trials with UPCOMING or IN_PROGRESS status can be cancelled.
     *
     * @param cancelledBy The user (Admin or Commissioner) who cancelled the trial
     * @throws IllegalStateException if the trial is already cancelled or completed
     */
    public void cancel(UserAccount cancelledBy) {
        Status currentStatus = getStatus();

        if (currentStatus == Status.CANCELED) {
            throw new IllegalStateException("Ce trial est déjà annulé.");
        }

        if (currentStatus == Status.COMPLETED) {
            throw new IllegalStateException("Impossible d'annuler un trial terminé.");
        }

        // Only UPCOMING and IN_PROGRESS can be cancelled
        this.cancelled = true;
        this.cancelledAt = LocalDateTime.now();
        this.cancelledBy = cancelledBy;
    }
}
