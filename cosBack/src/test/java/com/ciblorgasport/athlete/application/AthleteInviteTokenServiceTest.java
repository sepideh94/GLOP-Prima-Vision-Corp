package com.ciblorgasport.athlete.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.security.ActivationToken;
import com.ciblorgasport.security.ActivationTokenRepository;
import com.ciblorgasport.security.TokenType;

class AthleteInviteTokenServiceTest {

    @Test
    void shouldCreateAthleteInviteToken() {
        ActivationTokenRepository repository = org.mockito.Mockito.mock(ActivationTokenRepository.class);
        when(repository.save(any(ActivationToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AthleteInviteTokenService service = new AthleteInviteTokenService(repository);
        Athlete athlete = new Athlete();
        athlete.setId(7L);

        String token = service.createInviteToken(athlete);

        assertThat(token).isNotBlank();
        ArgumentCaptor<ActivationToken> captor = ArgumentCaptor.forClass(ActivationToken.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(TokenType.INVITE_ATHLETE);
        assertThat(captor.getValue().getUser()).isEqualTo(athlete);
        assertThat(captor.getValue().isUsed()).isFalse();
    }
}
