package com.ciblorgasport.geolocation.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class TrialEventDto {
    private Long trialId;
    private String trialName;
    private LocalDate startDate;
    private LocalTime startHour;
    private Long siteId;
    private double latitude;
    private double longitude;
}
