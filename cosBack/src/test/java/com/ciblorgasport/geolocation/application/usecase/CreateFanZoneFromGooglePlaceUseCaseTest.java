package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.application.port.GeoLocationService;
import com.ciblorgasport.geolocation.application.port.NearbyPlace;
import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import com.ciblorgasport.geolocation.dto.FanZoneResponse;
import com.ciblorgasport.geolocation.dto.GooglePlaceImportRequest;
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
@DisplayName("CreateFanZoneFromGooglePlaceUseCase — Tests unitaires")
class CreateFanZoneFromGooglePlaceUseCaseTest {

    @Mock private GeoLocationService geoLocationService;
    @Mock private FanZoneRepository  fanZoneRepository;
    @InjectMocks private CreateFanZoneFromGooglePlaceUseCase useCase;

    @Nested
    @DisplayName("execute()")
    class Execute {

        @Test
        @DisplayName("Importe un lieu Google Maps et crée la fan zone")
        void shouldImportGooglePlaceAndCreateFanZone() {
            GooglePlaceImportRequest request = buildRequest("ChIJD7fiBh9u5kcRYJSMaMOCCwQ", null, "Grande terrasse!");
            NearbyPlace place = buildPlace("ChIJD7fiBh9u5kcRYJSMaMOCCwQ", "Le Pub du Stade", "3 rue des Sports, Paris", 48.87, 2.33, FanZoneType.BAR);
            when(geoLocationService.getPlaceDetails("ChIJD7fiBh9u5kcRYJSMaMOCCwQ")).thenReturn(place);
            when(fanZoneRepository.save(any())).thenAnswer(inv -> {
                FanZone fz = inv.getArgument(0);
                fz.setId(10L);
                return fz;
            });

            FanZoneResponse response = useCase.execute(request);

            assertEquals("Le Pub du Stade", response.getName());
            assertEquals(FanZoneType.BAR, response.getType());
            assertEquals("ChIJD7fiBh9u5kcRYJSMaMOCCwQ", response.getGooglePlaceId());
        }

        @Test
        @DisplayName("Override de type prioritaire sur la suggestion Google")
        void shouldUseOverrideTypeWhenProvided() {
            GooglePlaceImportRequest request = buildRequest("place123", FanZoneType.EVENT_SPACE, null);
            NearbyPlace place = buildPlace("place123", "Pub central", "1 place du jeu", 48.85, 2.35, FanZoneType.BAR);
            when(geoLocationService.getPlaceDetails("place123")).thenReturn(place);
            ArgumentCaptor<FanZone> captor = ArgumentCaptor.forClass(FanZone.class);
            when(fanZoneRepository.save(captor.capture())).thenAnswer(inv -> {
                FanZone fz = inv.getArgument(0);
                fz.setId(11L);
                return fz;
            });

            useCase.execute(request);

            assertEquals(FanZoneType.EVENT_SPACE, captor.getValue().getType());
        }

        @Test
        @DisplayName("PUBLIC_VIEWING par défaut si Google ne suggère aucun type")
        void shouldDefaultToPublicViewingWhenNoSuggestion() {
            GooglePlaceImportRequest request = buildRequest("place456", null, null);
            NearbyPlace place = buildPlace("place456", "Esplanade", "Esplanade du port", 43.29, 5.37, null);
            when(geoLocationService.getPlaceDetails("place456")).thenReturn(place);
            ArgumentCaptor<FanZone> captor = ArgumentCaptor.forClass(FanZone.class);
            when(fanZoneRepository.save(captor.capture())).thenAnswer(inv -> {
                FanZone fz = inv.getArgument(0);
                fz.setId(12L);
                return fz;
            });

            useCase.execute(request);

            assertEquals(FanZoneType.PUBLIC_VIEWING, captor.getValue().getType());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static GooglePlaceImportRequest buildRequest(String placeId, FanZoneType overrideType, String description) {
        GooglePlaceImportRequest r = new GooglePlaceImportRequest();
        r.setPlaceId(placeId);
        r.setOverrideType(overrideType);
        r.setDescription(description);
        return r;
    }

    private static NearbyPlace buildPlace(String placeId, String name, String address,
                                           double lat, double lng, FanZoneType type) {
        return NearbyPlace.builder()
                .googlePlaceId(placeId)
                .name(name)
                .address(address)
                .latitude(lat)
                .longitude(lng)
                .suggestedType(type)
                .build();
    }
}
