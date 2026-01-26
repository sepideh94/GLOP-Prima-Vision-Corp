package com.ciblorgasport.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@Profile("!test")
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    @Value("${api.base-url:http://localhost:8080}")
    private String apiBaseUrl;

    @Value("${app.base-url:${APP_BASE_URL:http://localhost:3000}}")
    private String appBaseUrl;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendActivationEmail(String to, String firstName, String token) {
        String link = apiBaseUrl + "/api/auth/activate?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("Validez votre inscription - CiblOrgaSport");
        msg.setText(
            "Bonjour " + (firstName != null ? firstName : "") + ",\n\n" +
            "Bienvenue sur CiblOrgaSport !\n\n" +
            "Merci pour votre inscription. Cliquez sur ce lien pour activer votre compte :\n" +
            link + "\n\n" +
            "Une fois votre compte activé, vous pourrez vous connecter avec votre identifiant (votre email) et votre mot de passe.\n\n" +
            "Ce lien expirera après 24 heures.\n\n" +
            "À bientôt,\n" +
            "L’équipe CiblOrgaSport"
        );
        mailSender.send(msg);
    }

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String token) {
        String link = appBaseUrl + "/reset-password?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("Réinitialisation de mot de passe - CiblOrgaSport");
        msg.setText(
            "Bonjour " + (firstName != null ? firstName : "") + ",\n\n" +
            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
            "Cliquez sur ce lien pour définir un nouveau mot de passe :\n" +
            link + "\n\n" +
            "Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.\n\n" +
            "Ce lien expirera après 30 minutes.\n\n" +
            "À bientôt,\n" +
            "L’équipe CiblOrgaSport"
        );
        mailSender.send(msg);
    }

    @Override
    public void sendCommissionnerInviteEmail(String to, String firstName, String token) {
        String link = appBaseUrl + "/reset-password?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("Invitation - Définissez votre mot de passe (CiblOrgaSport)");
        msg.setText(
            "Bonjour " + (firstName != null ? firstName : "") + ",\n\n" +
            "Un administrateur vous a créé un compte Commissaire sur CiblOrgaSport.\n\n" +
            "Pour activer votre compte et définir votre mot de passe, cliquez sur ce lien :\n" +
            link + "\n\n" +
            "Ce lien expirera après 24 heures.\n\n" +
            "Si vous n’êtes pas concerné, vous pouvez ignorer cet email.\n\n" +
            "À bientôt,\n" +
            "L’équipe CiblOrgaSport"
        );
        mailSender.send(msg);
    }
}
