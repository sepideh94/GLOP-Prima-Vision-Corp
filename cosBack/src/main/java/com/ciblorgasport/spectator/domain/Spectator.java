package com.ciblorgasport.spectator.domain;

import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "spectator")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@DiscriminatorValue("SPECTATOR")
public class Spectator extends UserAccount {
	
	
	@Override
	public String getRoleName() {
		return "ROLE_SPECTATOR";
	}

	public boolean isAdmin{return false;}
	public boolean isCommissionner{return false;}
	public boolean isAthlete{return false;}
	public boolean isVolonteer{return false;}
	public boolean isSpectator{return true;}
}