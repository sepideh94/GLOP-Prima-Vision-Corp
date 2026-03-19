package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.dto.*;
import com.ciblorgasport.geolocation.infrastructure.AthleteLocationRepository;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetMapDataUseCase {

    private final SiteRepository siteRepository;
    private final TrialRepository trialRepository;
    private final FanZoneRepository fanZoneRepository;
    private final AthleteLocationRepository athleteLocationRepository;

    public MapDataResponse execute(boolean includeAthletes) {
        List<MarkerDto> siteMarkers = siteRepository.findAll().stream()
                .map(site -> MarkerDto.builder()
                        .id(site.getId())
                        .type("SITE")
                        .name(site.getAdress())
                        .latitude(site.getLatitude())
                        .longitude(site.getLongitude())
                        .build())
                .collect(Collectors.toList());

        List<MarkerDto> fanZoneMarkers = fanZoneRepository.findAll().stream()
                .map(fz -> MarkerDto.builder()
                        .id(fz.getId())
                        .type("FAN_ZONE")
                        .name(fz.getName())
                        .latitude(fz.getLatitude())
                        .longitude(fz.getLongitude())
                        .metadata(fz.getType().name())
                        .build())
                .collect(Collectors.toList());

        List<TrialEventDto> events = trialRepository.findAll().stream()
                .filter(t -> !t.isCancelled() && t.getSite() != null)
                .map(t -> TrialEventDto.builder()
                        .trialId(t.getId())
                        .trialName(t.getName())
                        .startDate(t.getStartDate())
                        .startHour(t.getStartHour())
                        .siteId(t.getSite().getId())
                        .latitude(t.getSite().getLatitude())
                        .longitude(t.getSite().getLongitude())
                        .build())
                .collect(Collectors.toList());

        List<AthleteLocationResponse> athleteLocations = null;
        if (includeAthletes) {
            athleteLocations = athleteLocationRepository.findAll().stream()
                    .map(AthleteLocationResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        return MapDataResponse.builder()
                .sites(siteMarkers)
                .fanZones(fanZoneMarkers)
                .events(events)
                .athleteLocations(athleteLocations)
                .build();
    }
}
