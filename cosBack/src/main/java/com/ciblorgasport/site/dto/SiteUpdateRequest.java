package com.ciblorgasport.site.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SiteUpdateRequest {

    @NotBlank(message = "L'adresse du site est obligatoire.")
    private String adress;

    private double latitude;

    private double longitude;
}
