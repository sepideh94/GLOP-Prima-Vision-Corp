package com.ciblorgasport.geolocation.adapter.googlemaps.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GooglePlaceResult {

    @JsonProperty("place_id")
    private String placeId;

    private String name;

    @JsonProperty("formatted_address")
    private String formattedAddress;

    private Geometry geometry;

    private Double rating;

    private List<String> types;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Geometry {
        private Location location;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Location {
        private double lat;
        private double lng;
    }
}
