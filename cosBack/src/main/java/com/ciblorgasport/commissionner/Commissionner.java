package com.ciblorgasport.commissionner;

import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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

	@Override
	public boolean isEnabled() {
	    return isActive();
	}

	public boolean isCommissionner(){
		return true;
	}
	
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "accreditation_doc_id")
	private Document accreditationDocument;

	private boolean isAccredited = false;

}
