package com.ciblorgasport.user.domain;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.ciblorgasport.admin.domain.Admin;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@SuperBuilder
@Table(name = "user_account")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
public abstract class UserAccount implements UserDetails {
	
	@Column(updatable = false)
	private LocalDateTime createdAt;
	
    private LocalDateTime updatedAt;
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	
	private String firstName;
	private String lastName;
	 
	@Column(unique = true, nullable = false)
	private String email;
	
	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
    private boolean isActive = false;

    public abstract String getRoleName();

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		
		return List.of(new SimpleGrantedAuthority(getRoleName()));
	}

	@Override
	public String getPassword() {
		
		return password;
	}

	@Override
	public String getUsername() {
		return email;
	}
	
	
	@Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
    return true; 
     }


    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isAdmin(){return false;}
    public boolean isCommissionner(){return false;}
    public boolean isAthlete(){return false;}
    public boolean isVolonteer(){return false;}
    public boolean isSpectator(){return false;}

}
