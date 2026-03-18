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

    
    @Override
    public void sendAthleteInviteEmail(String to, String firstName, String token) {
    }

	@Override
	public void sendVolonteerInviteEmail(String to, String firstName, String token) {		
	}

    @Override
    public void sendIncidentNotificationEmail(String to, String firstName, String subject, String message, String link){
    }

    @Override
    public void sendAccreditationValidatedEmail(String to, String firstName) {
    }

    @Override
    public void sendAccreditationRefusedEmail(String to, String firstName, String reason) {
    }
}
