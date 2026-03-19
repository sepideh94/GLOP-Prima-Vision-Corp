package com.ciblorgasport.geolocation.adapter.googlemaps;

import com.ciblorgasport.geolocation.adapter.googlemaps.dto.GoogleDirectionsResult;
import com.ciblorgasport.geolocation.adapter.googlemaps.dto.GooglePlaceResult;
import com.ciblorgasport.geolocation.application.port.*;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.stream.Collectors;

@Component
@Primary
@RequiredArgsConstructor
@Slf4j
public class GoogleMapsGeoLocationAdapter implements GeoLocationService {

    private static final String PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    private static final String PLACE_DETAILS_URL  = "https://maps.googleapis.com/maps/api/place/details/json";
    private static final String GEOCODE_URL         = "https://maps.googleapis.com/maps/api/geocode/json";
    private static final String DIRECTIONS_URL      = "https://maps.googleapis.com/maps/api/directions/json";

    private final RestTemplate restTemplate;
    private final GoogleMapsConfig config;

    @Override
    public List<NearbyPlace> searchNearbyPlaces(double latitude, double longitude, double radiusKm, String keyword) {
        String url = UriComponentsBuilder.fromHttpUrl(PLACES_NEARBY_URL)
                .queryParam("location", latitude + "," + longitude)
                .queryParam("radius", (int) (radiusKm * 1000))
                .queryParam("keyword", keyword)
                .queryParam("key", config.getApiKey())
                .toUriString();

        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null) return Collections.emptyList();

            List<?> results = (List<?>) response.get("results");
            if (results == null) return Collections.emptyList();

            return results.stream()
                    .map(r -> parseNearbyPlace((Map<?, ?>) r))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erreur lors de la recherche Google Maps: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public GeoCoordinates geocodeAddress(String address) {
        String url = UriComponentsBuilder.fromHttpUrl(GEOCODE_URL)
                .queryParam("address", address)
                .queryParam("key", config.getApiKey())
                .toUriString();

        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null) throw new RuntimeException("Réponse vide de l'API Geocoding");

            List<?> results = (List<?>) response.get("results");
            if (results == null || results.isEmpty())
                throw new RuntimeException("Adresse introuvable: " + address);

            Map<?, ?> first = (Map<?, ?>) results.get(0);
            Map<?, ?> geometry = (Map<?, ?>) first.get("geometry");
            Map<?, ?> location = (Map<?, ?>) geometry.get("location");

            return new GeoCoordinates(
                    ((Number) location.get("lat")).doubleValue(),
                    ((Number) location.get("lng")).doubleValue()
            );
        } catch (Exception e) {
            log.error("Erreur geocoding: {}", e.getMessage());
            throw new RuntimeException("Impossible de géocoder l'adresse: " + address, e);
        }
    }

    @Override
    public RouteInfo calculateRoute(double fromLat, double fromLng, double toLat, double toLng, TravelMode mode) {
        String url = UriComponentsBuilder.fromHttpUrl(DIRECTIONS_URL)
                .queryParam("origin", fromLat + "," + fromLng)
                .queryParam("destination", toLat + "," + toLng)
                .queryParam("mode", mode.name().toLowerCase())
                .queryParam("key", config.getApiKey())
                .toUriString();

        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null) throw new RuntimeException("Réponse vide de l'API Directions");

            List<?> routes = (List<?>) response.get("routes");
            if (routes == null || routes.isEmpty())
                throw new RuntimeException("Aucun itinéraire trouvé");

            Map<?, ?> route = (Map<?, ?>) routes.get(0);
            List<?> legs = (List<?>) route.get("legs");
            Map<?, ?> leg = (Map<?, ?>) legs.get(0);

            Map<?, ?> distance = (Map<?, ?>) leg.get("distance");
            Map<?, ?> duration = (Map<?, ?>) leg.get("duration");

            double distanceKm = ((Number) distance.get("value")).doubleValue() / 1000.0;
            int durationMinutes = ((Number) duration.get("value")).intValue() / 60;

            List<?> steps = (List<?>) leg.get("steps");
            String firstInstruction = steps != null && !steps.isEmpty()
                    ? (String) ((Map<?, ?>) steps.get(0)).get("html_instructions")
                    : null;

            return RouteInfo.builder()
                    .summary((String) route.get("summary"))
                    .distanceKm(distanceKm)
                    .durationMinutes(durationMinutes)
                    .polyline(Collections.emptyList())
                    .htmlInstructions(firstInstruction)
                    .build();
        } catch (Exception e) {
            log.error("Erreur calcul itinéraire: {}", e.getMessage());
            throw new RuntimeException("Impossible de calculer l'itinéraire", e);
        }
    }

    @Override
    public NearbyPlace getPlaceDetails(String placeId) {
        String url = UriComponentsBuilder.fromHttpUrl(PLACE_DETAILS_URL)
                .queryParam("place_id", placeId)
                .queryParam("fields", "place_id,name,formatted_address,geometry,rating,types")
                .queryParam("key", config.getApiKey())
                .toUriString();

        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null) throw new RuntimeException("Réponse vide");

            Map<?, ?> result = (Map<?, ?>) response.get("result");
            if (result == null) throw new RuntimeException("Lieu introuvable: " + placeId);

            return parseNearbyPlace(result);
        } catch (Exception e) {
            log.error("Erreur récupération détails lieu: {}", e.getMessage());
            throw new RuntimeException("Impossible de récupérer les détails du lieu: " + placeId, e);
        }
    }

    private NearbyPlace parseNearbyPlace(Map<?, ?> result) {
        try {
            Map<?, ?> geometry = (Map<?, ?>) result.get("geometry");
            Map<?, ?> location = (Map<?, ?>) geometry.get("location");
            double lat = ((Number) location.get("lat")).doubleValue();
            double lng = ((Number) location.get("lng")).doubleValue();

            List<?> types = (List<?>) result.get("types");
            FanZoneType fanZoneType = inferFanZoneType(types);

            Double rating = result.get("rating") != null
                    ? ((Number) result.get("rating")).doubleValue()
                    : null;

            String address = result.containsKey("formatted_address")
                    ? (String) result.get("formatted_address")
                    : (String) result.get("vicinity");

            return NearbyPlace.builder()
                    .googlePlaceId((String) result.get("place_id"))
                    .name((String) result.get("name"))
                    .address(address)
                    .latitude(lat)
                    .longitude(lng)
                    .suggestedType(fanZoneType)
                    .rating(rating)
                    .build();
        } catch (Exception e) {
            log.warn("Impossible de parser le lieu Google Maps: {}", e.getMessage());
            return null;
        }
    }

    private FanZoneType inferFanZoneType(List<?> types) {
        if (types == null) return FanZoneType.PUBLIC_VIEWING;
        List<String> typeStrings = types.stream().map(Object::toString).collect(Collectors.toList());
        if (typeStrings.contains("bar") || typeStrings.contains("night_club")) return FanZoneType.BAR;
        if (typeStrings.contains("event_venue") || typeStrings.contains("stadium")) return FanZoneType.EVENT_SPACE;
        return FanZoneType.PUBLIC_VIEWING;
    }
}
