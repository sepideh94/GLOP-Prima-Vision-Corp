package com.ciblorgasport.volonteer.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.security.ActivationToken;
import com.ciblorgasport.security.ActivationTokenRepository;
import com.ciblorgasport.security.TokenType;

class VolonteerInviteTokenServiceTest {

    @Test
    void shouldCreateInviteTokenAndPersistIt() {
        ActivationTokenRepository repository = org.mockito.Mockito.mock(ActivationTokenRepository.class);
        when(repository.save(any(ActivationToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        VolonteerInviteTokenService service = new VolonteerInviteTokenService(repository);
        Volonteer user = new Volonteer();
        user.setId(1L);

        String token = service.createInviteToken(user);

        assertThat(token).isNotBlank();
        ArgumentCaptor<ActivationToken> captor = ArgumentCaptor.forClass(ActivationToken.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(TokenType.INVITE_VOLONTEER);
        assertThat(captor.getValue().getUser()).isEqualTo(user);
        assertThat(captor.getValue().isUsed()).isFalse();
    }
}
