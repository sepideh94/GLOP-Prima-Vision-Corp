package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.domain.AthleteLocation;
import com.ciblorgasport.geolocation.dto.AthleteLocationResponse;
import com.ciblorgasport.geolocation.dto.AthleteLocationUpdateRequest;
import com.ciblorgasport.geolocation.infrastructure.AthleteLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UpdateAthleteLocationUseCase {

    private final AthleteLocationRepository athleteLocationRepository;

    public AthleteLocationResponse execute(Long athleteId, AthleteLocationUpdateRequest request) {
        AthleteLocation location = athleteLocationRepository.findByAthleteId(athleteId)
                .map(existing -> {
                    existing.setLatitude(request.getLatitude());
                    existing.setLongitude(request.getLongitude());
                    existing.setTimestamp(LocalDateTime.now());
                    return existing;
                })
                .orElseGet(() -> AthleteLocation.builder()
                        .athleteId(athleteId)
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .timestamp(LocalDateTime.now())
                        .build());

        AthleteLocation saved = athleteLocationRepository.save(location);
        return AthleteLocationResponse.fromEntity(saved);
    }
}
