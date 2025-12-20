package com.ciblorgasport.competition.domain;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import com.ciblorgasport.core.Status;
import com.ciblorgasport.core.StatusChecker;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.trial.domain.Trial;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "competition")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Competition implements StatusChecker {
 
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 private String name;
 private String description;
 private LocalDateTime startDate;
 private LocalDateTime endDate;


 @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
 @JsonManagedReference
 private List<Trial> trials;


 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "id_event", nullable = false) 
 @JsonBackReference
 private Event parentEvent;


@Override
public boolean hasStarted() {
	return this.startDate.isBefore(LocalDateTime.now());
}


@Override
public boolean hasEnded() {
	return this.endDate.isBefore(LocalDateTime.now());
}

/**
 * Determines the current status of this competition.
 * Status is calculated dynamically based on:
 * - Start and end dates compared to current time
 * - Whether all trials are completed (for COMPLETED status)
 *
 * @return The current status of the competition
 */
public Status getStatus() {
	LocalDateTime now = LocalDateTime.now();

	// Check if competition hasn't started yet
	if (startDate.isAfter(now)) {
		return Status.UPCOMING;
	}

	// Check if competition has ended OR all trials are completed
	boolean endDatePassed = endDate.isBefore(now);
	boolean allTrialsCompleted = trials != null && !trials.isEmpty() &&
		trials.stream().allMatch(trial -> trial.getStatus() == Status.COMPLETED);

	if (endDatePassed || allTrialsCompleted) {
		return Status.COMPLETED;
	}

	// Competition is between start and end dates
	return Status.IN_PROGRESS;
}
 
}