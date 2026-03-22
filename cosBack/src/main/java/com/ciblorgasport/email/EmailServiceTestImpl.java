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

    @Override
    public void sendAdminAccreditationSubmittedEmail(String toAdminEmail, String adminFirstName, String commissionnerName) {
    }

    @Override
    public void sendCommissionerParticipationSubmittedEmail(String toEmail, String commissionnerName, String athleteName) {
    }

    @Override
    public void sendAthleteParticipationValidatedEmail(String toEmail, String athleteName) {
    }

    @Override
    public void sendAthleteParticipationRefusedEmail(String toEmail, String athleteName, String rejectedDocument, String reason) {
        System.out.println("Mock Email: Vos documents ont été refusés pour " + athleteName + " (" + toEmail + ")");
    }

    @Override
    public void sendTeamParticipationValidatedEmail(String toEmail, String athleteName, String teamName) {
        System.out.println("Mock Email: Participation de l'équipe " + teamName + " confirmée pour " + athleteName + " (" + toEmail + ")");
    }
}
