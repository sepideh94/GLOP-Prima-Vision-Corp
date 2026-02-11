package com.ciblorgasport.athlete.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Past;
import lombok.Data;

@Data
public class AthleteProfileUpdateRequest {

	private String nationality;

	@Past(message = "La date de naissance doit être dans le passé")
	private LocalDate birthDate;

	private String sexe;

	private String passportNumber;

	private Boolean hasAcceptedCharte;
}
