package com.ciblorgasport.geolocation.dto;

import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FanZoneResponse {

    private Long id;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private Integer capacity;
    private FanZoneType type;
    private String description;
    private String googlePlaceId;

    public static FanZoneResponse fromEntity(FanZone fanZone) {
        return FanZoneResponse.builder()
                .id(fanZone.getId())
                .name(fanZone.getName())
                .address(fanZone.getAddress())
                .latitude(fanZone.getLatitude())
                .longitude(fanZone.getLongitude())
                .capacity(fanZone.getCapacity())
                .type(fanZone.getType())
                .description(fanZone.getDescription())
                .googlePlaceId(fanZone.getGooglePlaceId())
                .build();
    }
}
