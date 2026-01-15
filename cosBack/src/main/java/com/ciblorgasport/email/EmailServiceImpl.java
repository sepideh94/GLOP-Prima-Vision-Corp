package com.ciblorgasport.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    @Value("${api.base-url:http://localhost:8080}")
    private String apiBaseUrl;

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
}
