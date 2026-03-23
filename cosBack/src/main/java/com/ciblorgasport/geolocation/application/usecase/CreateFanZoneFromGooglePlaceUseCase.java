package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.application.port.GeoLocationService;
import com.ciblorgasport.geolocation.application.port.NearbyPlace;
import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import com.ciblorgasport.geolocation.dto.FanZoneResponse;
import com.ciblorgasport.geolocation.dto.GooglePlaceImportRequest;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateFanZoneFromGooglePlaceUseCase {

    private final GeoLocationService geoLocationService;
    private final FanZoneRepository fanZoneRepository;

    public FanZoneResponse execute(GooglePlaceImportRequest request) {
        NearbyPlace place = geoLocationService.getPlaceDetails(request.getPlaceId());

        FanZoneType type = request.getOverrideType() != null
                ? request.getOverrideType()
                : (place.getSuggestedType() != null ? place.getSuggestedType() : FanZoneType.PUBLIC_VIEWING);

        FanZone fanZone = FanZone.builder()
                .name(place.getName())
                .address(place.getAddress())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .type(type)
                .description(request.getDescription())
                .googlePlaceId(place.getGooglePlaceId())
                .build();

        FanZone saved = fanZoneRepository.save(fanZone);
        return FanZoneResponse.fromEntity(saved);
    }
}
