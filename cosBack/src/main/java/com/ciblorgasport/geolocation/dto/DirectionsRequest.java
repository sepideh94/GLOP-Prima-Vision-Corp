package com.ciblorgasport.geolocation.dto;

import com.ciblorgasport.geolocation.application.port.TravelMode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DirectionsRequest {

    @NotNull
    private Double fromLatitude;

    @NotNull
    private Double fromLongitude;

    // L'une de ces trois options doit être fournie
    private Long siteId;
    private Long fanZoneId;
    private Double toLatitude;
    private Double toLongitude;

    private TravelMode travelMode;
}
