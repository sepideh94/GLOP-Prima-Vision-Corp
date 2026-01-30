package com.ciblorgasport.athlete.domain;

import com.ciblorgasport.common.domain.Competitor;
import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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


	public boolean isAdmin(){return false;}
	public boolean isCommissionner(){return false;}
	public boolean isAthlete(){return true;}
	public boolean isVolonteer(){return false;}
	public boolean isSpectator(){return false;}

}
