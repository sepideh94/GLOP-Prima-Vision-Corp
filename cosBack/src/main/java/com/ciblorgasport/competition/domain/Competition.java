package com.ciblorgasport.competition.domain;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

import com.ciblorgasport.core.StatusChecker;
import com.ciblorgasport.event.domain.Event;

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
 private LocalDate startDate;


 /*@OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
 private List<Trial> trials;*/


 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "id_event", nullable = false) 
 private Event parentEvent;


@Override
public boolean hasStarted() {
	return this.startDate.isBefore(LocalDate.now());
}


@Override
public boolean hasEnded() {
	return false;
}
 
}