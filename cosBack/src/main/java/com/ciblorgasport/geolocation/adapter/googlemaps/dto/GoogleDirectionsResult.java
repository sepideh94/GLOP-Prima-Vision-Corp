package com.ciblorgasport.geolocation.adapter.googlemaps.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleDirectionsResult {

    private String status;
    private List<Route> routes;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Route {
        private String summary;
        private List<Leg> legs;
        @JsonProperty("overview_polyline")
        private OverviewPolyline overviewPolyline;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Leg {
        private TextValue distance;
        private TextValue duration;
        private List<Step> steps;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Step {
        @JsonProperty("html_instructions")
        private String htmlInstructions;
        private TextValue distance;
        private TextValue duration;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TextValue {
        private String text;
        private int value;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OverviewPolyline {
        private String points;
    }
}
