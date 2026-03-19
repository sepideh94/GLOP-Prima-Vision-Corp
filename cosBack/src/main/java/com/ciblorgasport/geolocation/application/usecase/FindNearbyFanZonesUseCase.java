package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.application.port.GeoLocationService;
import com.ciblorgasport.geolocation.application.port.NearbyPlace;
import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.GeoPoint;
import com.ciblorgasport.geolocation.dto.FanZoneResponse;
import com.ciblorgasport.geolocation.dto.NearbyFanZonesResponse;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FindNearbyFanZonesUseCase {

    private final FanZoneRepository fanZoneRepository;
    private final GeoLocationService geoLocationService;

    public NearbyFanZonesResponse execute(double latitude, double longitude, double radiusKm) {
        GeoPoint userPoint = new GeoPoint(latitude, longitude);

        // Fan zones depuis la base de données
        List<FanZoneResponse> saved = fanZoneRepository.findAll().stream()
                .filter(fz -> userPoint.distanceTo(new GeoPoint(fz.getLatitude(), fz.getLongitude())) <= radiusKm)
                .map(FanZoneResponse::fromEntity)
                .collect(Collectors.toList());

        // Suggestions depuis Google Maps (bars, espaces publics)
        List<NearbyPlace> suggestions = geoLocationService.searchNearbyPlaces(latitude, longitude, radiusKm, "bar OR public_space");

        return NearbyFanZonesResponse.builder()
                .savedFanZones(saved)
                .googleSuggestions(suggestions)
                .build();
    }
}
