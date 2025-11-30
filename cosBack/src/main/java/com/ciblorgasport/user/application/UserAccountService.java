package com.ciblorgasport.user.application;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAccountService implements UserDetailsService{
	
	
	@Autowired
	private final UserAccountRepository userRepo ;
	
	
	private final PasswordEncoder passwordEncoder;
	
	
	
	public UserAccount save(UserAccount newUser) {
		
		this.userRepo.findByEmail(newUser.getEmail()).ifPresent(u -> {
            throw new IllegalArgumentException("Un utilisateur existe déjà avec cet email.");
        });
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
	
	
	public void changePassword(String email, String oldPassword, String newPassword) {
        UserAccount user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Ancien mot de passe incorrect.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }

}
