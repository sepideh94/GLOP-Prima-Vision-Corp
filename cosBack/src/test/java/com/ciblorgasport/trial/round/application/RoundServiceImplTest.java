package com.ciblorgasport.trial.round.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;
import com.ciblorgasport.trial.round.dto.RoundCreateRequest;
import com.ciblorgasport.trial.round.infrastructure.RoundRepository;

class RoundServiceImplTest {

    @Test
    void create_get_delete_shouldWork() {
        RoundRepository repository = org.mockito.Mockito.mock(RoundRepository.class);
        RoundServiceImpl service = new RoundServiceImpl(repository);

        RoundCreateRequest request = new RoundCreateRequest();
        request.setName(RoundName.FINALE);
        when(repository.findAll()).thenReturn(List.of());
        when(repository.save(any(Round.class))).thenAnswer(invocation -> {
            Round r = invocation.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(repository.findById(1L)).thenReturn(Optional.of(new Round(1L, RoundName.FINALE, List.of())));
        when(repository.existsById(1L)).thenReturn(true);

        var created = service.create(request);
        assertThat(created.getId()).isEqualTo(1L);
        assertThat(created.getDisplayName()).isEqualTo("Finale");

        var byId = service.getById(1L);
        assertThat(byId.getName()).isEqualTo(RoundName.FINALE);

        assertThat(service.getAll()).hasSize(0);
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void shouldThrowWhenRoundAlreadyExistsOrMissing() {
        RoundRepository repository = org.mockito.Mockito.mock(RoundRepository.class);
        RoundServiceImpl service = new RoundServiceImpl(repository);

        RoundCreateRequest request = new RoundCreateRequest();
        request.setName(RoundName.FINALE);
        when(repository.findAll()).thenReturn(List.of(new Round(1L, RoundName.FINALE, List.of())));
        when(repository.findById(99L)).thenReturn(Optional.empty());
        when(repository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.create(request)).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(() -> service.getById(99L)).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(() -> service.delete(99L)).isInstanceOf(RuntimeException.class);
    }
}
