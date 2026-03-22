package com.ciblorgasport.geolocation.dto;

import com.ciblorgasport.geolocation.domain.FanZoneType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GooglePlaceImportRequest {

    @NotBlank(message = "Le Place ID Google Maps est obligatoire.")
    private String placeId;

    private FanZoneType overrideType;

    private String description;
}
