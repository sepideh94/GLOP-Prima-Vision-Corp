package com.ciblorgasport.athlete.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.ciblorgasport.common.domain.Competitor;
import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.user.domain.UserAccount;

import com.ciblorgasport.common.crypto.StringEncryptConverter;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "athlete")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@DiscriminatorValue("ATHLETE")
public class Athlete extends UserAccount implements Competitor {

	private String nationality;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	private String sexe;

	@Column(name = "passport_number")
	@Convert(converter = StringEncryptConverter.class)
	private String passportNumber;

	@OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "passport_document_id")
	private Document passportDocument;

	@Column(name = "has_accepted_charte", nullable = false, columnDefinition = "boolean default false")
	@Builder.Default
	private boolean hasAcceptedCharte = false;
	
    @Column(name = "charterAccepted_at")
    private LocalDateTime charterAcceptedAt;

	@OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "medical_certificate_id")
	private Document medicalCertificate;

	@Override
	public String getRoleName() {
		return "ROLE_ATHLETE";
	}

	@Override
	public String getDisplayName() {
		return getFirstName() + " " + getLastName();
	}
	
	@Override
	public boolean isEnabled() {
	    return isActive();
	}
	
	public boolean isProfileComplete() {
	    return nationality != null && 
	           birthDate != null && 
	           sexe != null && 
	           passportNumber != null && 
	           passportDocument != null && 
	           medicalCertificate != null && 
	           hasAcceptedCharte;
	}


	public boolean isAdmin(){return false;}
	public boolean isCommissionner(){return false;}
	public boolean isAthlete(){return true;}
	public boolean isVolonteer(){return false;}
	public boolean isSpectator(){return false;}

}
