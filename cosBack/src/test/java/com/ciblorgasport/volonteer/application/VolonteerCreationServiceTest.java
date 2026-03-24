package com.ciblorgasport.volonteer.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.volonteer.domain.Volonteer;

class VolonteerCreationServiceTest {

    @Test
    void createUser_shouldPersistInactiveVolonteerAndSendInvite() {
        UserAccountService userService = org.mockito.Mockito.mock(UserAccountService.class);
        PasswordEncoder passwordEncoder = org.mockito.Mockito.mock(PasswordEncoder.class);
        VolonteerInviteTokenService tokenService = org.mockito.Mockito.mock(VolonteerInviteTokenService.class);
        EmailService emailService = org.mockito.Mockito.mock(EmailService.class);

        when(passwordEncoder.encode(any())).thenReturn("encoded-password");
        when(userService.save(any(Volonteer.class))).thenAnswer(invocation -> {
            Volonteer v = invocation.getArgument(0);
            v.setId(1L);
            return v;
        });
        when(tokenService.createInviteToken(any())).thenReturn("invite-token");

        VolonteerCreationService service = new VolonteerCreationService(userService, passwordEncoder, tokenService, emailService);

        CreateUserRequest request = new CreateUserRequest();
        request.setFirstName("Paul");
        request.setLastName("Martin");
        request.setEmail("paul@test.com");

        Volonteer created = (Volonteer) service.createUser(request);

        assertThat(created.getId()).isEqualTo(1L);
        assertThat(created.getEmail()).isEqualTo("paul@test.com");
        assertThat(created.isActive()).isFalse();
        assertThat(created.getPassword()).isEqualTo("encoded-password");

        verify(tokenService).createInviteToken(created);
        verify(emailService).sendVolonteerInviteEmail("paul@test.com", "Paul", "invite-token");
    }
}
