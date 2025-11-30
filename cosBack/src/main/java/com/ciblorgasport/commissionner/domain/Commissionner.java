package com.ciblorgasport.commissionner.domain;

import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "commissionner")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@DiscriminatorValue("COMMISSIONNER")
public class Commissionner extends UserAccount {
	
	@Override
	public String getRoleName() {
		
		return "ROLE_COMMISSIONNER";
	}

}
