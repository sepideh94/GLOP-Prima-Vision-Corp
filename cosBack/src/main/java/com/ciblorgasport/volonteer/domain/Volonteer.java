package com.ciblorgasport.volonteer.domain;

import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@Entity
@Table(name = "volonteer")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@DiscriminatorValue("VOLONTEER")
public class Volonteer extends UserAccount {
	
	@Override
	public String getRoleName() {
		
		return "ROLE_VOLONTEER";
	}

	public boolean isAdmin{return false;}
	public boolean isCommissionner{return false;}
	public boolean isAthlete{return false;}
	public boolean isVolonteer{return true;}
	public boolean isSpectator{return false;}
}
