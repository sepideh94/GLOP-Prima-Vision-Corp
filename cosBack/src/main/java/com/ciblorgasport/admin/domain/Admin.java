package com.ciblorgasport.admin.domain;

import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "admin")
@Data
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@DiscriminatorValue("ADMIN")
public class Admin extends UserAccount {
	
	@Override
	public String getRoleName() {
		return "ROLE_ADMIN";
	}

	public boolean isAdmin{return true;}
	public boolean isCommissionner{return false;}
	public boolean isAthlete{return false;}
	public boolean isVolonteer{return false;}
	public boolean isSpectator{return false;}
	
   
}