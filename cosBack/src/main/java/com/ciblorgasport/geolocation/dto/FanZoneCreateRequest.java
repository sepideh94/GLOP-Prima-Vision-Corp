package com.ciblorgasport.geolocation.dto;

import com.ciblorgasport.geolocation.domain.FanZoneType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FanZoneCreateRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    private String name;

    @NotBlank(message = "L'adresse est obligatoire.")
    private String address;

    private double latitude;
    private double longitude;

    private Integer capacity;

    @NotNull(message = "Le type est obligatoire.")
    private FanZoneType type;

    private String description;
}
