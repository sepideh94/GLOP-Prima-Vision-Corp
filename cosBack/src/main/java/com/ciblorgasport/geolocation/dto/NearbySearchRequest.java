package com.ciblorgasport.geolocation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class NearbySearchRequest {

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @Positive
    private double radiusKm = 5.0;
}
