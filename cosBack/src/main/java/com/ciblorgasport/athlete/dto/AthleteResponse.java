package com.ciblorgasport.athlete.dto;

import java.time.LocalDate;
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
    private String nationality;
    private LocalDate birthDate;
    private String sexe;
    private String passportNumber;
    private boolean hasPassport;
    private boolean hasAcceptedCharte;
    private boolean hasMedicalCertificate;

    public static AthleteResponse fromEntity(Athlete athlete) {
        return AthleteResponse.builder()
                .id(athlete.getId())
                .firstName(athlete.getFirstName())
                .lastName(athlete.getLastName())
                .email(athlete.getEmail())
                .createdAt(athlete.getCreatedAt())
                .nationality(athlete.getNationality())
                .birthDate(athlete.getBirthDate())
                .sexe(athlete.getSexe())
                .passportNumber(athlete.getPassportNumber())
                .hasPassport(athlete.getPassportDocument() != null)
                .hasAcceptedCharte(athlete.isHasAcceptedCharte())
                .hasMedicalCertificate(athlete.getMedicalCertificate() != null)
                .build();
    }
}
