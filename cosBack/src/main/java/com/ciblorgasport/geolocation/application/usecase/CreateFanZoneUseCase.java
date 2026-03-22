package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.dto.FanZoneCreateRequest;
import com.ciblorgasport.geolocation.dto.FanZoneResponse;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CreateFanZoneUseCase {

    private final FanZoneRepository fanZoneRepository;

    public List<FanZoneResponse> findAll() {
        return fanZoneRepository.findAll().stream()
                .map(FanZoneResponse::fromEntity)
                .toList();
    }

    public void delete(Long id) {
        fanZoneRepository.deleteById(id);
    }

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
