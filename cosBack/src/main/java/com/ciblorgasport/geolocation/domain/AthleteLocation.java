package com.ciblorgasport.geolocation.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "athlete_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long athleteId;

    private double latitude;
    private double longitude;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
