package com.ciblorgasport.geolocation.application.port;

import lombok.Builder;
import lombok.Value;
import java.util.List;

@Value
@Builder
public class RouteInfo {
    String summary;
    double distanceKm;
    int durationMinutes;
    List<double[]> polyline;
    String htmlInstructions;
}
