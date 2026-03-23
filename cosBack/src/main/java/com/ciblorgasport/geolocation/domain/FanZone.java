package com.ciblorgasport.geolocation.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fan_zone")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FanZone implements GeoLocatable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    private double latitude;
    private double longitude;

    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FanZoneType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "google_place_id")
    private String googlePlaceId;
}
