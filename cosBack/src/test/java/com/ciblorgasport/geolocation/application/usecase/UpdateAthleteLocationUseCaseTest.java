package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.domain.AthleteLocation;
import com.ciblorgasport.geolocation.dto.AthleteLocationResponse;
import com.ciblorgasport.geolocation.dto.AthleteLocationUpdateRequest;
import com.ciblorgasport.geolocation.infrastructure.AthleteLocationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UpdateAthleteLocationUseCase — Tests unitaires")
class UpdateAthleteLocationUseCaseTest {

    @Mock private AthleteLocationRepository repository;
    @InjectMocks private UpdateAthleteLocationUseCase useCase;

    @Nested
    @DisplayName("execute()")
    class Execute {

        @Test
        @DisplayName("Crée une nouvelle entrée si l'athlète n'a pas encore de position")
        void shouldCreateNewLocationWhenNotExists() {
            when(repository.findByAthleteId(1L)).thenReturn(Optional.empty());
            when(repository.save(any())).thenAnswer(inv -> {
                AthleteLocation loc = inv.getArgument(0);
                loc.setId(1L);
                return loc;
            });

            AthleteLocationUpdateRequest req = buildRequest(48.85, 2.35);
            AthleteLocationResponse response = useCase.execute(1L, req);

            assertEquals(1L, response.getAthleteId());
            assertEquals(48.85, response.getLatitude());
            assertEquals(2.35, response.getLongitude());
            assertNotNull(response.getTimestamp());
        }

        @Test
        @DisplayName("Met à jour la position existante de l'athlète")
        void shouldUpdateExistingLocation() {
            AthleteLocation existing = buildExisting(5L, 1L, 40.0, 1.0, LocalDateTime.now().minusHours(1));
            when(repository.findByAthleteId(1L)).thenReturn(Optional.of(existing));
            when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            AthleteLocationUpdateRequest req = buildRequest(48.85, 2.35);
            AthleteLocationResponse response = useCase.execute(1L, req);

            assertEquals(48.85, response.getLatitude());
            assertEquals(2.35, response.getLongitude());
        }

        @Test
        @DisplayName("Le timestamp est mis à jour à la date/heure actuelle")
        void shouldUpdateTimestamp() {
            when(repository.findByAthleteId(2L)).thenReturn(Optional.empty());
            ArgumentCaptor<AthleteLocation> captor = ArgumentCaptor.forClass(AthleteLocation.class);
            when(repository.save(captor.capture())).thenAnswer(inv -> {
                AthleteLocation loc = inv.getArgument(0);
                loc.setId(2L);
                return loc;
            });

            LocalDateTime before = LocalDateTime.now().minusSeconds(1);
            useCase.execute(2L, buildRequest(48.0, 2.0));
            LocalDateTime after = LocalDateTime.now().plusSeconds(1);

            assertTrue(captor.getValue().getTimestamp().isAfter(before));
            assertTrue(captor.getValue().getTimestamp().isBefore(after));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static AthleteLocationUpdateRequest buildRequest(double lat, double lng) {
        AthleteLocationUpdateRequest r = new AthleteLocationUpdateRequest();
        r.setLatitude(lat);
        r.setLongitude(lng);
        return r;
    }

    private static AthleteLocation buildExisting(Long id, Long athleteId, double lat, double lng, LocalDateTime ts) {
        return AthleteLocation.builder().id(id).athleteId(athleteId).latitude(lat).longitude(lng).timestamp(ts).build();
    }
}
