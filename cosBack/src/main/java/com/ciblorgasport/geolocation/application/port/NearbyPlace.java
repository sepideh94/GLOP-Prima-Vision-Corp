package com.ciblorgasport.geolocation.application.port;

import com.ciblorgasport.geolocation.domain.FanZoneType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NearbyPlace {
    String googlePlaceId;
    String name;
    String address;
    double latitude;
    double longitude;
    FanZoneType suggestedType;
    Double rating;
}
