package com.ciblorgasport.site.dto;

import com.ciblorgasport.site.domain.Site;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SiteResponse {
    private Long id;
    private String adress;
    private double latitude;
    private double longitude;

    /**
     * Méthode de conversion statique depuis l'entité Site.
     */
    public static SiteResponse fromEntity(Site site) {
        return SiteResponse.builder()
                .id(site.getId())
                .adress(site.getAdress())
                .latitude(site.getLatitude())
                .longitude(site.getLongitude())
                .build();
    }
}
