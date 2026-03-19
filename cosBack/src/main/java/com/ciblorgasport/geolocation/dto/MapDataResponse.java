package com.ciblorgasport.geolocation.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MapDataResponse {
    private List<MarkerDto> sites;
    private List<MarkerDto> fanZones;
    private List<TrialEventDto> events;
    private List<AthleteLocationResponse> athleteLocations;
}
