package com.ciblorgasport.geolocation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AthleteLocationUpdateRequest {

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}
