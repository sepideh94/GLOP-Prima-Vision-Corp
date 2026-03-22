package com.ciblorgasport.geolocation.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class TrialWithLocationDto {
    private Long trialId;
    private String trialName;
    private LocalDate startDate;
    private LocalTime startHour;
    private LocalDate endDate;
    private LocalTime endHour;
    private Long siteId;
    private String siteAddress;
    private double latitude;
    private double longitude;
    private double distanceKm;
}
