package com.ciblorgasport.event.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_event")
    private Long idEvent;

    @NotBlank(message = "Le nom de l'événement est obligatoire.")
    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @NotNull(message = "La date de début est obligatoire.")
    @FutureOrPresent(message = "La date de début doit être dans le présent ou le futur.")
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
}
