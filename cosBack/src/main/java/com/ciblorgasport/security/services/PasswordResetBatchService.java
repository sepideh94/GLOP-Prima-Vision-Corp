package com.ciblorgasport.security.services;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetBatchService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetBatchService.class);

    private final AuthenticationService authenticationService;

    public PasswordResetBatchService(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @Async
    public void sendResetLinks(List<String> emails) {
        for (String email : emails) {
            try {
                authenticationService.forgotPassword(email);
            } catch (Exception e) {
                log.error("Reset mail failed for {} : {}", email, e.getMessage());
            }
        }
    }
}
