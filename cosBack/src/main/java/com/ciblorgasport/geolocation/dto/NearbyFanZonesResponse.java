package com.ciblorgasport.geolocation.dto;

import com.ciblorgasport.geolocation.application.port.NearbyPlace;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class NearbyFanZonesResponse {
    private List<FanZoneResponse> savedFanZones;
    private List<NearbyPlace> googleSuggestions;
}
