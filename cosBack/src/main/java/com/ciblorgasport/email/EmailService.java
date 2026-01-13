package com.ciblorgasport.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String to, String firstName) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("Bienvenue sur CiblOrgaSport !");
        msg.setText(
            "Bonjour " + (firstName != null ? firstName : "") + ",\n\n" +
            "Bienvenue sur CiblOrgaSport. Votre compte spectateur a bien été créé.\n\n" +
            "À bientôt,\n" +
            "L’équipe CiblOrgaSport"
        );

        mailSender.send(msg);
    }
}
