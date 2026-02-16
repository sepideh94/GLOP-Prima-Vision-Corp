package com.ciblorgasport.volonteer.application;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.application.UserCreationService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.volonteer.domain.Volonteer;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VolonteerCreationService implements UserCreationService {
    
    private final UserAccountService userService;
    private final PasswordEncoder passwordEncoder;
    private final VolonteerInviteTokenService tokenService;
    private final EmailService emailService;

    @Override
    public UserAccount createUser(CreateUserRequest request) {
    	
    	String technicalPassword = UUID.randomUUID().toString();
        Volonteer newVolonteer = Volonteer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(technicalPassword))
                .isActive(false)
                .build();

        Volonteer volonteerSaved= (Volonteer) userService.save(newVolonteer);
        
        String token = tokenService.createInviteToken(volonteerSaved);
        emailService.sendVolonteerInviteEmail(volonteerSaved.getEmail(), volonteerSaved.getFirstName(), token);
        
        return volonteerSaved;
        
    }
}