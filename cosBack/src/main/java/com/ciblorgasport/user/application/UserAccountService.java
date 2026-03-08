package com.ciblorgasport.user.application;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVRecord;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.user.dto.UserResponse;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAccountService implements UserDetailsService {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    @Transactional
    public UserAccount save(UserAccount newUser) {
        String normalizedEmail = normalizeEmail(newUser.getEmail());
        newUser.setEmail(normalizedEmail);

        this.userRepo.findByEmail(normalizedEmail).ifPresent(u -> {
            throw new IllegalArgumentException("Un utilisateur existe déjà avec cet email.");
        });

        return this.userRepo.save(newUser);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalized = normalizeEmail(username);
        return userRepo.findByEmail(normalized)
                .orElseThrow(() -> new UsernameNotFoundException("Username not found"));
    }

    public UserDetailsService userDetailsService() {
        return this::loadUserByUsername;
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        String normalized = normalizeEmail(email);

        UserAccount user = userRepo.findByEmail(normalized)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Ancien mot de passe incorrect.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
	
	public List<UserResponse> getAllUsersForAdmin() {
	    return userRepo.findAll().stream()
	            .map((UserAccount user) -> UserResponse.builder()
	                    .id(user.getId())
	                    .firstName(user.getFirstName())
	                    .lastName(user.getLastName())
	                    .email(user.getEmail())
	                    .role(user.getRoleName().replace("ROLE_", ""))
	                    .isAccountActive(user.isEnabled())
	                    .build())
	            .collect(Collectors.toList());
	}

	public UserResponse getUserByIdForAdmin(Long id) {
	    UserAccount user = userRepo.findById(id)
	            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
	    return UserResponse.builder()
	            .id(user.getId())
	            .firstName(user.getFirstName())
	            .lastName(user.getLastName())
	            .email(user.getEmail())
	            .role(user.getRoleName().replace("ROLE_", ""))
	            .isAccountActive(user.isEnabled())
	            .build();
	}

	@Transactional
	public void setUserActive(Long id, boolean active) {
	    UserAccount user = userRepo.findById(id)
	            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
	    user.setActive(active);
	    userRepo.save(user);
	}

	@Transactional
	public String resetUserPasswordByAdmin(Long id) {
	    UserAccount user = userRepo.findById(id)
	            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
	    String tempPassword = UUID.randomUUID().toString().substring(0, 8);
	    user.setPassword(passwordEncoder.encode(tempPassword));
	    userRepo.save(user);
	    return tempPassword;
	}
	
	public void createAndInviteUser(CSVRecord record, UserCreationService creationService) {
	    String email = record.get("email");
	    
	    if (userRepo.findByEmail(email).isPresent()) return;

	    String tempPassword = UUID.randomUUID().toString().substring(0, 8);
	    
	    CreateUserRequest request = CreateUserRequest.builder()
	            .email(email)
	            .firstName(record.get("firstName"))
	            .lastName(record.get("lastName"))
	            .password(tempPassword) 
	            .build();

	    creationService.createUser(request);

	}

}
