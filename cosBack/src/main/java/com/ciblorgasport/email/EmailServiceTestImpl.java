package com.ciblorgasport.email;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("test")
public class EmailServiceTestImpl implements EmailService {

    @Override
    public void sendActivationEmail(String to, String firstName, String token) {
    }

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String token) {
    }

    @Override
    public void sendCommissionnerInviteEmail(String to, String firstName, String token) {
    }
}
