                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            package com.ciblorgasport.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;


@Service
@Profile("!test")
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    @Value("${api.base-url:http://localhost:8083}")
    private String apiBaseUrl;

    @Value("${app.base-url:${APP_BASE_URL:http://localhost:3000}}")
    private String appBaseUrl;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String hello(String firstName) {
        return "Bonjour " + (firstName != null ? firstName : "") + ",\n\n";
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);
        mailSender.send(msg);
    }

    @Override
    public void sendActivationEmail(String to, String firstName, String token) {
        String link = apiBaseUrl + "/api/auth/activate?token=" + token;

        sendEmail(
            to,
            "Validez votre inscription - CiblOrgaSport",
            hello(firstName) +
            "Bienvenue sur CiblOrgaSport !\n\n" +
            "Merci pour votre inscription. Cliquez sur ce lien pour activer votre compte :\n" +
            link + "\n\n" +
            "Une fois votre compte activé, vous pourrez vous connecter avec votre identifiant (votre email) et votre mot de passe.\n\n" +
            "Ce lien expirera après 24 heures.\n\n" +
            "À bientôt,\n" +
            "L’équipe CiblOrgaSport"
        );
    }

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String token) {
        String link = appBaseUrl + "/reset-password?token=" + token;

        sendEmail(
            to,
            "Réinitialisation de mot de passe - CiblOrgaSport",
            hello(firstName) +
            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
            "Cliquez sur ce lien pour définir un nouveau mot de passe :\n" +
            link + "\n\n" +
            "Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.\n\n" +
            "Ce lien expirera après 30 minutes.\n\n" +
            "À bientôt,\n" +
            "L’équipe CiblOrgaSport"
        );
    }

    @Override
    public void sendCommissionnerInviteEmail(String to, String firstName, String token) {
        String link = appBaseUrl + "/reset-password?token=" + token;

        sendEmail(
            to,
            "Invitation - Définissez votre mot de passe (CiblOrgaSport)",
            hello(firstName) +
            "Un administrateur vous a créé un compte Commissaire sur CiblOrgaSport.\n\n" +
            "Pour activer votre compte et définir votre mot de passe, cliquez sur ce lien :\n" +
            link + "\n\n" +
            "Ce lien expirera après 24 heures.\n\n" +
            "Si vous n’êtes pas concerné, vous pouvez ignorer cet email.\n\n" +
            "À bientôt,\n" +
            "L’équipe CiblOrgaSport"
        );
    }

    @Override
    public void sendAthleteInviteEmail(String to, String firstName, String token) {
        String resetLink = appBaseUrl + "/reset-password?token=" + token;
        String competitionsLink = appBaseUrl + "/auth/athlete-invite?next=/athlete/competitions";

        sendEmail(
            to,
            "Invitation à une compétition - CiblOrgaSport",
            hello(firstName) +
            "Nous sommes ravis de vous inviter à rejoindre CiblOrgaSport en tant qu’athlète.\n\n" +
            "En tant qu'athlète invité(e), votre présence serait un atout majeur pour cet événement.\n\n" +
            "Pour accéder aux détails (horaires, règlements) et valider votre inscription, veuillez cliquer sur le lien ci-dessous :\n\n" +
            "👉 Accéder à l'événement :\n" +
            competitionsLink + "\n\n" +
            "Première connexion ou mot de passe oublié ?\n\n" +
            "Si vous n'avez pas encore activé votre compte athlète ou si vous ne vous souvenez plus de vos identifiants, vous devez définir votre mot de passe pour pouvoir vous connecter.\n\n" +
            "Cela ne prend qu'une minute :\n\n" +
            "🔐 Activer mon compte / Réinitialiser mon mot de passe :\n" +
            resetLink + "\n\n" +
            "Nous avons hâte de vous voir en action !\n\n" +
            "Sportivement,\n" +
            "L’équipe CiblOrgaSport"
        );
    }

@Override
public void sendVolonteerInviteEmail(String to, String firstName, String token) {
    String resetLink = appBaseUrl + "/reset-password?token=" + token;

    String volonteerLink = appBaseUrl + "/auth/volonteer-invite?next=/volonteer/dashboard";

    SimpleMailMessage msg = new SimpleMailMessage();
    msg.setFrom(from);
    msg.setTo(to);
    msg.setSubject("Invitation : Devenez volontaire - CiblOrgaSport");
    msg.setText(
        "Bonjour " + (firstName != null ? firstName : "") + ",\n\n" +
        "Vous avez été invité(e) à rejoindre l'équipe des volontaires sur CiblOrgaSport.\n\n" +
        "Votre aide est précieuse pour la réussite de nos compétitions.\n\n" +
        "👉 Accéder à mon espace volontaire :\n" +
        volonteerLink + "\n\n" +
        "🔐 Activer mon compte / Définir mon mot de passe :\n" +
        resetLink + "\n\n" +
        "Ce lien est nécessaire pour votre première connexion.\n\n" +
        "Sportivement,\n" +
        "L’équipe CiblOrgaSport"
    );

    mailSender.send(msg);
}

@Override
@Async("mailExecutor")
public void sendIncidentNotificationEmail(String to, String displayName, String subject, String message, String link) {
    String safeDisplayName = (displayName == null || displayName.isBlank()) ? "utilisateur" : displayName;

    String body = """
            Bonjour %s,

            %s

            Pour consulter les détails, veuillez vous connecter à votre espace :
            %s

            Cordialement,
            L'équipe CiblOrgaSport
            """.formatted(safeDisplayName, message, link);

    sendEmail(to, subject, body);
}
}
