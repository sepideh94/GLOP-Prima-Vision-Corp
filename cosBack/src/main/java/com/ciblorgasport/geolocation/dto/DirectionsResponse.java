package com.ciblorgasport.geolocation.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DirectionsResponse {
    private String summary;
    private double distanceKm;
    private int durationMinutes;
    private List<double[]> polyline;
    private String htmlInstructions;
    private double destinationLatitude;
    private double destinationLongitude;
}
