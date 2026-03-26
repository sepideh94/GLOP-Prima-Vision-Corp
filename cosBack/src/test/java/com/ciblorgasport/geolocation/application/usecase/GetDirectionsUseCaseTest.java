package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.common.exception.ResourceNotFoundException;
import com.ciblorgasport.geolocation.application.port.GeoLocationService;
import com.ciblorgasport.geolocation.application.port.RouteInfo;
import com.ciblorgasport.geolocation.application.port.TravelMode;
import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import com.ciblorgasport.geolocation.dto.DirectionsRequest;
import com.ciblorgasport.geolocation.dto.DirectionsResponse;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetDirectionsUseCase — Tests unitaires")
class GetDirectionsUseCaseTest {

    @Mock private GeoLocationService geoLocationService;
    @Mock private SiteRepository     siteRepository;
    @Mock private FanZoneRepository  fanZoneRepository;
    @InjectMocks private GetDirectionsUseCase useCase;

    @Nested
    @DisplayName("execute() — destination via Site")
    class ViaSite {

        @Test
        @DisplayName("Calcule l'itinéraire vers un site")
        void shouldCalculateRouteToSite() {
            Site site = buildSite(1L, 48.860, 2.360);
            when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
            when(geoLocationService.calculateRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble(), any()))
                    .thenReturn(buildRoute("Via A1", 12.5, 20));

            DirectionsRequest request = buildRequest(48.85, 2.35, 1L, null, null, null, TravelMode.DRIVING);
            DirectionsResponse response = useCase.execute(request);

            assertEquals("Via A1", response.getSummary());
            assertEquals(12.5, response.getDistanceKm());
            assertEquals(20, response.getDurationMinutes());
            verify(siteRepository).findById(1L);
        }

        @Test
        @DisplayName("Site introuvable → ResourceNotFoundException")
        void siteNotFound_throwsIllegalArgumentException() {
            when(siteRepository.findById(99L)).thenReturn(Optional.empty());
            DirectionsRequest request = buildRequest(48.85, 2.35, 99L, null, null, null, null);
            assertThrows(ResourceNotFoundException.class, () -> useCase.execute(request));
        }
    }

    @Nested
    @DisplayName("execute() — destination via Fan Zone")
    class ViaFanZone {

        @Test
        @DisplayName("Calcule l'itinéraire vers une fan zone")
        void shouldCalculateRouteToFanZone() {
            FanZone fz = buildFanZone(1L, 48.870, 2.370);
            when(fanZoneRepository.findById(1L)).thenReturn(Optional.of(fz));
            when(geoLocationService.calculateRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble(), any()))
                    .thenReturn(buildRoute("Via centre", 3.2, 8));

            DirectionsRequest request = buildRequest(48.85, 2.35, null, 1L, null, null, TravelMode.WALKING);
            DirectionsResponse response = useCase.execute(request);

            assertEquals(3.2, response.getDistanceKm());
            verify(fanZoneRepository).findById(1L);
        }
    }

    @Nested
    @DisplayName("execute() — destination via coordonnées libres")
    class ViaCoordinates {

        @Test
        @DisplayName("Calcule l'itinéraire vers des coordonnées GPS directes")
        void shouldCalculateRouteToRawCoordinates() {
            when(geoLocationService.calculateRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble(), any()))
                    .thenReturn(buildRoute("Direct", 1.5, 5));

            DirectionsRequest request = buildRequest(48.85, 2.35, null, null, 48.86, 2.36, TravelMode.WALKING);
            DirectionsResponse response = useCase.execute(request);

            assertEquals(1.5, response.getDistanceKm());
            verifyNoInteractions(siteRepository, fanZoneRepository);
        }

        @Test
        @DisplayName("Aucune destination spécifiée → BusinessValidationException")
        void noDestination_throwsIllegalArgumentException() {
            DirectionsRequest request = buildRequest(48.85, 2.35, null, null, null, null, null);
            assertThrows(BusinessValidationException.class, () -> useCase.execute(request));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static Site buildSite(Long id, double lat, double lng) {
        Site s = new Site();
        s.setId(id);
        s.setAdress("Piscine olympique");
        s.setLatitude(lat);
        s.setLongitude(lng);
        return s;
    }

    private static FanZone buildFanZone(Long id, double lat, double lng) {
        return FanZone.builder().id(id).name("Fan Zone").address("addr").latitude(lat).longitude(lng)
                .type(FanZoneType.PUBLIC_VIEWING).build();
    }

    private static RouteInfo buildRoute(String summary, double distKm, int durationMin) {
        return RouteInfo.builder().summary(summary).distanceKm(distKm).durationMinutes(durationMin)
                .polyline(Collections.emptyList()).build();
    }

    private static DirectionsRequest buildRequest(double fromLat, double fromLng,
                                                   Long siteId, Long fanZoneId,
                                                   Double toLat, Double toLng,
                                                   TravelMode mode) {
        DirectionsRequest r = new DirectionsRequest();
        r.setFromLatitude(fromLat);
        r.setFromLongitude(fromLng);
        r.setSiteId(siteId);
        r.setFanZoneId(fanZoneId);
        r.setToLatitude(toLat);
        r.setToLongitude(toLng);
        r.setTravelMode(mode);
        return r;
    }
}
