package com.ciblorgasport.geolocation.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarkerDto {
    private Long id;
    private String type;   // "SITE", "FAN_ZONE"
    private String name;
    private double latitude;
    private double longitude;
    private String metadata;
}
