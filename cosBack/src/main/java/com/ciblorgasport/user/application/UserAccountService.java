package com.ciblorgasport.user.application;

import java.time.LocalDateTime;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAccountService implements UserDetailsService{
	
	private final UserAccountRepository userRepo ;
	
	
	
	public UserAccount save(UserAccount newUser) {
		if (newUser.getId() == null) {
			newUser.setCreatedAt(LocalDateTime.now());
		}
		
		newUser.setUpdatedAt(LocalDateTime.now());
		return this.userRepo.save(newUser);
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		return userRepo.findByEmail(username)
				.orElseThrow(()-> new UsernameNotFoundException("Username not found"));

	}

	public UserDetailsService userDetailsService() {
        return this::loadUserByUsername; 
    }
}
