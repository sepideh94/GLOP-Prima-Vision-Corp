package com.ciblorgasport.geolocation.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.geolocation.domain.AthleteLocation;
import com.ciblorgasport.geolocation.dto.AthleteLocationResponse;
import com.ciblorgasport.geolocation.infrastructure.AthleteLocationRepository;

@ExtendWith(MockitoExtension.class)
class ListAdminAthleteLocationsUseCaseTest {

    @Mock
    private AthleteLocationRepository athleteLocationRepository;
    @Mock
    private AthleteRepository athleteRepository;
    @InjectMocks
    private ListAdminAthleteLocationsUseCase useCase;

    @Test
    void shouldReturnLocationsWithAthleteNamesWhenFound() {
        AthleteLocation loc = AthleteLocation.builder()
                .id(1L)
                .athleteId(12L)
                .latitude(10.1)
                .longitude(20.2)
                .timestamp(LocalDateTime.now())
                .build();
        Athlete athlete = Athlete.builder().firstName("Aya").lastName("Diallo").build();

        when(athleteLocationRepository.findAll()).thenReturn(List.of(loc));
        when(athleteRepository.findById(12L)).thenReturn(Optional.of(athlete));

        List<AthleteLocationResponse> result = useCase.execute();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAthleteId()).isEqualTo(12L);
        assertThat(result.get(0).getFirstName()).isEqualTo("Aya");
        assertThat(result.get(0).getLastName()).isEqualTo("Diallo");
    }

    @Test
    void shouldReturnLocationsWithoutNamesWhenAthleteMissing() {
        AthleteLocation loc = AthleteLocation.builder()
                .id(2L)
                .athleteId(33L)
                .latitude(1.0)
                .longitude(2.0)
                .timestamp(LocalDateTime.now())
                .build();

        when(athleteLocationRepository.findAll()).thenReturn(List.of(loc));
        when(athleteRepository.findById(33L)).thenReturn(Optional.empty());

        List<AthleteLocationResponse> result = useCase.execute();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFirstName()).isNull();
        assertThat(result.get(0).getLastName()).isNull();
    }
}
