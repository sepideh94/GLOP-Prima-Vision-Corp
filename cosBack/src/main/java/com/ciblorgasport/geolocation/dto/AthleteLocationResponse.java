package com.ciblorgasport.geolocation.dto;

import com.ciblorgasport.geolocation.domain.AthleteLocation;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AthleteLocationResponse {
    private Long id;
    private Long athleteId;
    private double latitude;
    private double longitude;
    private LocalDateTime timestamp;
    /** Renseigné uniquement sur l’API admin (carte opérations). */
    private String firstName;
    /** Renseigné uniquement sur l’API admin (carte opérations). */
    private String lastName;

    public static AthleteLocationResponse fromEntity(AthleteLocation loc) {
        return AthleteLocationResponse.builder()
                .id(loc.getId())
                .athleteId(loc.getAthleteId())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .timestamp(loc.getTimestamp())
                .build();
    }
}
