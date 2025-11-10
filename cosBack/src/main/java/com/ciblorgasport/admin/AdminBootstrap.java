package com.ciblorgasport.admin;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ciblorgasport.user.domain.Role;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class AdminBootstrap {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initAdmin() {
        return args -> {
            String adminEmail = "admin@cos.com";
            if (userRepo.findByEmail(adminEmail).isEmpty()) {
                UserAccount admin = UserAccount.builder()
                        .firstName("Root")
                        .lastName("Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Admin@123"))
                        .role(Role.ADMIN)
                        .build();
                userRepo.save(admin);
            }
        };
    }
}
