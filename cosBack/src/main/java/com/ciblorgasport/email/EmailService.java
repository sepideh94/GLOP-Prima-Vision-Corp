package com.ciblorgasport.email;

public interface EmailService {
    void sendActivationEmail(String to, String firstName, String token);

    void sendPasswordResetEmail(String to, String firstName, String token);

    void sendCommissionnerInviteEmail(String to, String firstName, String token);

    void sendAthleteInviteEmail(String to, String firstName, String token);
    
    void sendVolonteerInviteEmail(String to, String firstName, String token);

    void sendIncidentNotificationEmail(String to, String firstName, String subject, String message, String link);

    void sendAccreditationValidatedEmail(String to, String firstName);

    void sendAccreditationRefusedEmail(String to, String firstName, String reason);
}
