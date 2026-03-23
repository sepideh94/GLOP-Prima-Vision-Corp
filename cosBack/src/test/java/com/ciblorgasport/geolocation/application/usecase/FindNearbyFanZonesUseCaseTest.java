package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.application.port.GeoLocationService;
import com.ciblorgasport.geolocation.application.port.NearbyPlace;
import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import com.ciblorgasport.geolocation.dto.NearbyFanZonesResponse;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FindNearbyFanZonesUseCase — Tests unitaires")
class FindNearbyFanZonesUseCaseTest {

    @Mock private FanZoneRepository  fanZoneRepository;
    @Mock private GeoLocationService geoLocationService;
    @InjectMocks private FindNearbyFanZonesUseCase useCase;

    @Nested
    @DisplayName("execute()")
    class Execute {

        @Test
        @DisplayName("Combine fan zones BDD et suggestions Google Maps")
        void shouldCombineSavedFanZonesAndGoogleSuggestions() {
            FanZone saved = buildFanZone(1L, "Bar du coin", 48.857, 2.352, FanZoneType.BAR);
            NearbyPlace suggestion = buildSuggestion("place1", "Café Sport", 48.858, 2.354);

            when(fanZoneRepository.findAll()).thenReturn(List.of(saved));
            when(geoLocationService.searchNearbyPlaces(anyDouble(), anyDouble(), anyDouble(), anyString()))
                    .thenReturn(List.of(suggestion));

            NearbyFanZonesResponse response = useCase.execute(48.8566, 2.3522, 5.0);

            assertEquals(1, response.getSavedFanZones().size());
            assertEquals(1, response.getGoogleSuggestions().size());
            assertEquals("Bar du coin", response.getSavedFanZones().get(0).getName());
            assertEquals("Café Sport", response.getGoogleSuggestions().get(0).getName());
        }

        @Test
        @DisplayName("Filtre les fan zones BDD hors rayon")
        void shouldFilterSavedFanZonesOutsideRadius() {
            FanZone nearby = buildFanZone(1L, "Proche", 48.857, 2.352, FanZoneType.BAR);   // ~200m
            FanZone far    = buildFanZone(2L, "Loin",   45.764, 4.836, FanZoneType.BAR);   // Lyon

            when(fanZoneRepository.findAll()).thenReturn(List.of(nearby, far));
            when(geoLocationService.searchNearbyPlaces(anyDouble(), anyDouble(), anyDouble(), anyString()))
                    .thenReturn(List.of());

            NearbyFanZonesResponse response = useCase.execute(48.8566, 2.3522, 5.0);

            assertEquals(1, response.getSavedFanZones().size());
            assertEquals("Proche", response.getSavedFanZones().get(0).getName());
        }

        @Test
        @DisplayName("Retourne des listes vides si rien dans le rayon")
        void shouldReturnEmptyListsWhenNothingNearby() {
            when(fanZoneRepository.findAll()).thenReturn(List.of());
            when(geoLocationService.searchNearbyPlaces(anyDouble(), anyDouble(), anyDouble(), anyString()))
                    .thenReturn(List.of());

            NearbyFanZonesResponse response = useCase.execute(48.8566, 2.3522, 5.0);

            assertTrue(response.getSavedFanZones().isEmpty());
            assertTrue(response.getGoogleSuggestions().isEmpty());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static FanZone buildFanZone(Long id, String name, double lat, double lng, FanZoneType type) {
        return FanZone.builder().id(id).name(name).address("addr").latitude(lat).longitude(lng).type(type).build();
    }

    private static NearbyPlace buildSuggestion(String placeId, String name, double lat, double lng) {
        return NearbyPlace.builder().googlePlaceId(placeId).name(name).address("addr").latitude(lat).longitude(lng)
                .suggestedType(FanZoneType.BAR).build();
    }
}
