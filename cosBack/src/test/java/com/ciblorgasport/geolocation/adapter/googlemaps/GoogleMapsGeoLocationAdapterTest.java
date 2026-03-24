package com.ciblorgasport.geolocation.adapter.googlemaps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import com.ciblorgasport.geolocation.application.port.NearbyPlace;
import com.ciblorgasport.geolocation.application.port.RouteInfo;
import com.ciblorgasport.geolocation.application.port.TravelMode;

@ExtendWith(MockitoExtension.class)
class GoogleMapsGeoLocationAdapterTest {

    @Mock
    private RestTemplate restTemplate;
    @Mock
    private GoogleMapsConfig config;
    @InjectMocks
    private GoogleMapsGeoLocationAdapter adapter;

    @Test
    void shouldSearchNearbyPlacesAndParseFields() {
        when(config.getApiKey()).thenReturn("api-key");
        Map<String, Object> place = Map.of(
                "place_id", "abc",
                "name", "Fan Spot",
                "vicinity", "Paris",
                "geometry", Map.of("location", Map.of("lat", 48.85, "lng", 2.35)),
                "types", List.of("bar"),
                "rating", 4.6
        );
        when(restTemplate.getForObject(anyString(), org.mockito.ArgumentMatchers.eq(Map.class)))
                .thenReturn(Map.of("results", List.of(place)));

        List<NearbyPlace> result = adapter.searchNearbyPlaces(48.8, 2.3, 2.0, "fan zone");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getGooglePlaceId()).isEqualTo("abc");
        assertThat(result.get(0).getLatitude()).isEqualTo(48.85);
        assertThat(result.get(0).getAddress()).isEqualTo("Paris");
    }

    @Test
    void shouldReturnEmptyNearbyListWhenApiFails() {
        when(config.getApiKey()).thenReturn("api-key");
        when(restTemplate.getForObject(anyString(), org.mockito.ArgumentMatchers.eq(Map.class)))
                .thenThrow(new RuntimeException("down"));

        assertThat(adapter.searchNearbyPlaces(0, 0, 1, "x")).isEmpty();
    }

    @Test
    void shouldGeocodeAddress() {
        when(config.getApiKey()).thenReturn("api-key");
        Map<String, Object> response = Map.of(
                "results", List.of(
                        Map.of("geometry", Map.of("location", Map.of("lat", 12.3, "lng", 45.6)))
                )
        );
        when(restTemplate.getForObject(anyString(), org.mockito.ArgumentMatchers.eq(Map.class))).thenReturn(response);

        var coords = adapter.geocodeAddress("10 rue test");

        assertThat(coords.getLatitude()).isEqualTo(12.3);
        assertThat(coords.getLongitude()).isEqualTo(45.6);
    }

    @Test
    void shouldThrowWhenAddressCannotBeGeocoded() {
        when(config.getApiKey()).thenReturn("api-key");
        when(restTemplate.getForObject(anyString(), org.mockito.ArgumentMatchers.eq(Map.class)))
                .thenReturn(Map.of("results", List.of()));

        assertThatThrownBy(() -> adapter.geocodeAddress("introuvable"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Impossible de géocoder");
    }

    @Test
    void shouldFallbackToStraightLineWhenApiKeyMissing() {
        when(config.getApiKey()).thenReturn("");

        RouteInfo route = adapter.calculateRoute(48.8, 2.3, 48.9, 2.4, TravelMode.WALKING);

        assertThat(route.getSummary()).contains("Approximation");
        assertThat(route.getPolyline()).hasSize(2);
        assertThat(route.getDurationMinutes()).isGreaterThan(0);
    }

    @Test
    void shouldParseDirectionsResponseWhenStatusOk() {
        when(config.getApiKey()).thenReturn("api-key");
        Map<String, Object> response = Map.of(
                "status", "OK",
                "routes", List.of(
                        Map.of(
                                "summary", "Rue A",
                                "legs", List.of(
                                        Map.of(
                                                "distance", Map.of("value", 1200),
                                                "duration", Map.of("value", 600),
                                                "steps", List.of(Map.of("html_instructions", "Head north"))
                                        )
                                ),
                                "overview_polyline", Map.of("points", "_p~iF~ps|U_ulLnnqC_mqNvxq`@")
                        )
                )
        );
        when(restTemplate.getForObject(anyString(), org.mockito.ArgumentMatchers.eq(Map.class))).thenReturn(response);

        RouteInfo route = adapter.calculateRoute(1.0, 2.0, 3.0, 4.0, TravelMode.DRIVING);

        assertThat(route.getSummary()).isEqualTo("Rue A");
        assertThat(route.getDistanceKm()).isEqualTo(1.2);
        assertThat(route.getDurationMinutes()).isEqualTo(10);
        assertThat(route.getHtmlInstructions()).contains("Head north");
        assertThat(route.getPolyline()).hasSize(3);
    }

    @Test
    void shouldFallbackWhenDirectionsStatusNotOk() {
        when(config.getApiKey()).thenReturn("api-key");
        when(restTemplate.getForObject(anyString(), org.mockito.ArgumentMatchers.eq(Map.class)))
                .thenReturn(Map.of("status", "REQUEST_DENIED"));

        RouteInfo route = adapter.calculateRoute(1.0, 2.0, 1.2, 2.3, TravelMode.TRANSIT);

        assertThat(route.getSummary()).contains("REQUEST_DENIED");
        assertThat(route.getPolyline()).hasSize(2);
    }

    @Test
    void shouldGetPlaceDetails() {
        when(config.getApiKey()).thenReturn("api-key");
        Map<String, Object> result = Map.of(
                "place_id", "pid-1",
                "name", "Arena",
                "formatted_address", "Lyon",
                "geometry", Map.of("location", Map.of("lat", 45.75, "lng", 4.85)),
                "types", List.of("event_venue")
        );
        when(restTemplate.getForObject(anyString(), org.mockito.ArgumentMatchers.eq(Map.class)))
                .thenReturn(Map.of("result", result));

        NearbyPlace place = adapter.getPlaceDetails("pid-1");

        assertThat(place.getGooglePlaceId()).isEqualTo("pid-1");
        assertThat(place.getName()).isEqualTo("Arena");
        assertThat(place.getAddress()).isEqualTo("Lyon");
    }
}
