package com.ciblorgasport.email;

public interface EmailService {
    void sendActivationEmail(String to, String firstName, String token);

    void sendPasswordResetEmail(String to, String firstName, String token);

    void sendCommissionnerInviteEmail(String to, String firstName, String token);

}
