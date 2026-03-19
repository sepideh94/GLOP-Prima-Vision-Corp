package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.dto.FanZoneCreateRequest;
import com.ciblorgasport.geolocation.dto.FanZoneResponse;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateFanZoneUseCase {

    private final FanZoneRepository fanZoneRepository;

    public FanZoneResponse execute(FanZoneCreateRequest request) {
        FanZone fanZone = FanZone.builder()
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .capacity(request.getCapacity())
                .type(request.getType())
                .description(request.getDescription())
                .build();

        FanZone saved = fanZoneRepository.save(fanZone);
        return FanZoneResponse.fromEntity(saved);
    }
}
