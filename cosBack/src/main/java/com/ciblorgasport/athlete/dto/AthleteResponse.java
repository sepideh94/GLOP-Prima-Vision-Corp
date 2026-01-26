package com.ciblorgasport.athlete.dto;

import java.time.LocalDateTime;

import com.ciblorgasport.athlete.domain.Athlete;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AthleteResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDateTime createdAt;

    public static AthleteResponse fromEntity(Athlete athlete) {
        return AthleteResponse.builder()
                .id(athlete.getId())
                .firstName(athlete.getFirstName())
                .lastName(athlete.getLastName())
                .email(athlete.getEmail())
                .createdAt(athlete.getCreatedAt())
                .build();
    }
}
