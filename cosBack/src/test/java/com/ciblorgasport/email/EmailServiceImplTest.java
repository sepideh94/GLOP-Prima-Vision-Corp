package com.ciblorgasport.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import com.ciblorgasport.config.FrontendUrlBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private FrontendUrlBuilder frontendUrlBuilder;

    @InjectMocks
    private EmailServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "from", "noreply@cos.com");
        ReflectionTestUtils.setField(service, "apiBaseUrl", "http://localhost:8083");
        lenient().when(frontendUrlBuilder.path(anyString()))
                .thenAnswer(invocation -> "http://localhost:3000" + invocation.getArgument(0));
    }

    private SimpleMailMessage captureMessage() {
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        return captor.getValue();
    }

    @Test
    void sendActivationEmail_shouldSendMailWithLink() {
        service.sendActivationEmail("test@gmail.com", "Jean", "token-123");
        SimpleMailMessage msg = captureMessage();
        
        assertThat(msg.getFrom()).isEqualTo("noreply@cos.com");
        assertThat(msg.getTo()).containsExactly("test@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Validez votre inscription - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Jean")
            .contains("http://localhost:8083/api/auth/activate?token=token-123");
    }

    @Test
    void sendPasswordResetEmail_shouldSendMail() {
        service.sendPasswordResetEmail("user@gmail.com", "Marie", "token-reset");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("user@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Réinitialisation de mot de passe - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Marie")
            .contains("http://localhost:3000/reset-password?token=token-reset");
    }

    @Test
    void sendCommissionnerInviteEmail_shouldSendMail() {
        service.sendCommissionnerInviteEmail("comm@gmail.com", "Paul", "token-comm");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("comm@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Invitation - Définissez votre mot de passe (CiblOrgaSport)");
        assertThat(msg.getText())
            .contains("Bonjour Paul")
            .contains("http://localhost:3000/reset-password?token=token-comm");
    }

    @Test
    void sendAthleteInviteEmail_shouldSendMail() {
        service.sendAthleteInviteEmail("athlete@gmail.com", "Alice", "token-ath");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("athlete@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Invitation à une compétition - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Alice")
            .contains("http://localhost:3000/reset-password?token=token-ath")
            .contains("http://localhost:3000/login?next=/athlete/competitions");
    }

    @Test
    void sendVolonteerInviteEmail_shouldSendMail() {
        service.sendVolonteerInviteEmail("volo@gmail.com", "Bob", "token-volo");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("volo@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Invitation : Devenez volontaire - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Bob")
            .contains("http://localhost:3000/reset-password?token=token-volo")
            .contains("http://localhost:3000/login?next=/volunteer");
    }

    @Test
    void sendIncidentNotificationEmail_shouldSendMail() {
        service.sendIncidentNotificationEmail("admin@gmail.com", "Admin", "Alerte Incident", "Un incident s'est produit", "http://link");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("admin@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Alerte Incident");
        assertThat(msg.getText())
            .contains("Bonjour Admin")
            .contains("Un incident s'est produit")
            .contains("http://link");
    }

    @Test
    void sendAccreditationValidatedEmail_shouldSendMail() {
        service.sendAccreditationValidatedEmail("comm@gmail.com", "Paul");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("comm@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Votre accréditation a été validée - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Paul")
            .contains("http://localhost:3000/login?next=/commissioner");
    }

    @Test
    void sendAccreditationRefusedEmail_shouldSendMail() {
        service.sendAccreditationRefusedEmail("comm@gmail.com", "Paul", "Document flou");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("comm@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Votre accréditation a été refusée - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Paul")
            .contains("Document flou")
            .contains("http://localhost:3000/login?next=/commissioner");
    }

    @Test
    void sendAdminAccreditationSubmittedEmail_shouldSendMail() {
        service.sendAdminAccreditationSubmittedEmail("admin@gmail.com", "Admin", "Paul Comm");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("admin@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Nouvelle soumission d'accréditation - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Admin")
            .contains("Le commissaire Paul Comm")
            .contains("http://localhost:3000/login?next=/admin/users");
    }

    @Test
    void sendCommissionerParticipationSubmittedEmail_shouldSendMail() {
        service.sendCommissionerParticipationSubmittedEmail("comm@gmail.com", "Paul", "Alice Ath");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("comm@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Nouvelles pièces justificatives reçues - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Paul")
            .contains("L'athlète Alice Ath")
            .contains("http://localhost:3000/login?next=/commissioner/participants");
    }

    @Test
    void sendAthleteParticipationValidatedEmail_shouldSendMail() {
        service.sendAthleteParticipationValidatedEmail("ath@gmail.com", "Alice Ath");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("ath@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Vos documents ont été validés - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Alice Ath")
            .contains("http://localhost:3000/login?next=/athlete/competitions");
    }

    @Test
    void sendAthleteParticipationRefusedEmail_shouldSendMail() {
        service.sendAthleteParticipationRefusedEmail("ath@gmail.com", "Alice Ath", "Certif", "Périmé");
        SimpleMailMessage msg = captureMessage();

        assertThat(msg.getTo()).containsExactly("ath@gmail.com");
        assertThat(msg.getSubject()).isEqualTo("Vos documents ont été refusés - CiblOrgaSport");
        assertThat(msg.getText())
            .contains("Bonjour Alice Ath")
            .contains("Document concerné : Certif")
            .contains("Motif du refus : \"Périmé\"")
            .contains("http://localhost:3000/login?next=/athlete/profile");
    }

    @Test
    void edgeCases_shouldHandleNulls() {
        service.sendActivationEmail("test@gmail.com", null, "token-123");
        SimpleMailMessage msg = captureMessage();
        assertThat(msg.getText()).doesNotContain("null");

        reset(mailSender);
        service.sendAccreditationRefusedEmail("test@gmail.com", null, null);
        msg = captureMessage();
        assertThat(msg.getText()).doesNotContain("null");
        assertThat(msg.getText()).contains("Non spécifié");

        reset(mailSender);
        service.sendAthleteParticipationRefusedEmail("ath@gmail.com", null, null, null);
        msg = captureMessage();
        assertThat(msg.getText()).doesNotContain("null").contains("Inconnu").contains("Veuillez vérifier votre profil.");
    }
}
