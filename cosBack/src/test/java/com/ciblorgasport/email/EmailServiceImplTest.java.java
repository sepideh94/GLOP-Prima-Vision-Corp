package com.ciblorgasport.email;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class EmailServiceImplTest {

    @Test
    void sendActivationEmail_shouldSendMailWithLink() {
        JavaMailSender mailSender = mock(JavaMailSender.class);

        EmailServiceImpl service = new EmailServiceImpl(mailSender);

        ReflectionTestUtils.setField(service, "from", "noreply@cos.com");
        ReflectionTestUtils.setField(service, "apiBaseUrl", "http://localhost:8080");

        service.sendActivationEmail("test@gmail.com", "Jean", "token-123");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage msg = captor.getValue();
        assertThat(msg.getFrom()).isEqualTo("noreply@cos.com");
        assertThat(msg.getTo()).containsExactly("test@gmail.com");
        assertThat(msg.getSubject()).contains("Validez votre inscription");
        assertThat(msg.getText()).contains("token-123");
        assertThat(msg.getText()).contains("http://localhost:8080/api/auth/activate?token=token-123");
    }
}
