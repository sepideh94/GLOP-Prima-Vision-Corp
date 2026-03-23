package com.ciblorgasport.geolocation.domain;

public interface GeoLocatable {
    double getLatitude();
    double getLongitude();
    String getAddress();
    String getName();
}
