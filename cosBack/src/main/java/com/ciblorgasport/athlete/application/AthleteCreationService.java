package com.ciblorgasport.athlete.application;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.application.UserCreationService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AthleteCreationService implements UserCreationService {
	
	private final UserAccountService userService;
    private final PasswordEncoder passwordEncoder;
    
	@Override
	public UserAccount createUser(CreateUserRequest request) {
		Athlete newAthlete = Athlete.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        return userService.save(newAthlete);
    }
	

}
