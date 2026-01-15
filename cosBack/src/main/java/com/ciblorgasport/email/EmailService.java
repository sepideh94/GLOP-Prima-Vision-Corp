package com.ciblorgasport.email;

public interface EmailService {
    void sendActivationEmail(String to, String firstName, String token);
}
