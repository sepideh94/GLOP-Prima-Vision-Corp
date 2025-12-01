package com.ciblorgasport.volonteer.application;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    @Override
    public UserAccount createUser(CreateUserRequest request) {
        
        Volonteer newVolonteer = Volonteer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        return userService.save(newVolonteer);
    }
}