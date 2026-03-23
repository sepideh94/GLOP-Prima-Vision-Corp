package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import com.ciblorgasport.geolocation.dto.FanZoneCreateRequest;
import com.ciblorgasport.geolocation.dto.FanZoneResponse;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CreateFanZoneUseCase — Tests unitaires")
class CreateFanZoneUseCaseTest {

    @Mock private FanZoneRepository fanZoneRepository;
    @InjectMocks private CreateFanZoneUseCase useCase;

    @Nested
    @DisplayName("execute()")
    class Execute {

        @Test
        @DisplayName("Crée et persiste une fan zone avec toutes les données")
        void shouldCreateAndPersistFanZone() {
            FanZoneCreateRequest request = buildRequest("Stade Fan Zone", "1 rue du Sport", 48.85, 2.35, 500, FanZoneType.PUBLIC_VIEWING, "Vue officielle");
            FanZone saved = buildEntity(1L, request);
            when(fanZoneRepository.save(any(FanZone.class))).thenReturn(saved);

            FanZoneResponse response = useCase.execute(request);

            assertEquals(1L, response.getId());
            assertEquals("Stade Fan Zone", response.getName());
            assertEquals(FanZoneType.PUBLIC_VIEWING, response.getType());
            assertEquals(500, response.getCapacity());
            verify(fanZoneRepository).save(any(FanZone.class));
        }

        @Test
        @DisplayName("Mappe correctement les coordonnées GPS")
        void shouldMapCoordinatesCorrectly() {
            FanZoneCreateRequest request = buildRequest("Bar des Champions", "2 av. des Jeux", 43.29, 5.37, null, FanZoneType.BAR, null);
            ArgumentCaptor<FanZone> captor = ArgumentCaptor.forClass(FanZone.class);
            when(fanZoneRepository.save(captor.capture())).thenAnswer(inv -> {
                FanZone fz = inv.getArgument(0);
                fz.setId(2L);
                return fz;
            });

            useCase.execute(request);

            FanZone captured = captor.getValue();
            assertEquals(43.29, captured.getLatitude(), 0.001);
            assertEquals(5.37, captured.getLongitude(), 0.001);
        }

        @Test
        @DisplayName("Capacity null est acceptée (optionnel)")
        void shouldAcceptNullCapacity() {
            FanZoneCreateRequest request = buildRequest("Espace Public", "Place de la Mairie", 48.85, 2.35, null, FanZoneType.EVENT_SPACE, null);
            when(fanZoneRepository.save(any())).thenAnswer(inv -> {
                FanZone fz = inv.getArgument(0);
                fz.setId(3L);
                return fz;
            });

            FanZoneResponse response = useCase.execute(request);
            assertNull(response.getCapacity());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static FanZoneCreateRequest buildRequest(String name, String address, double lat, double lng,
                                                      Integer capacity, FanZoneType type, String description) {
        FanZoneCreateRequest r = new FanZoneCreateRequest();
        r.setName(name);
        r.setAddress(address);
        r.setLatitude(lat);
        r.setLongitude(lng);
        r.setCapacity(capacity);
        r.setType(type);
        r.setDescription(description);
        return r;
    }

    private static FanZone buildEntity(Long id, FanZoneCreateRequest r) {
        return FanZone.builder()
                .id(id)
                .name(r.getName())
                .address(r.getAddress())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .capacity(r.getCapacity())
                .type(r.getType())
                .description(r.getDescription())
                .build();
    }
}
