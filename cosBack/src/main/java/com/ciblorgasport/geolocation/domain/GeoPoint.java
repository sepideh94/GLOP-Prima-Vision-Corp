package com.ciblorgasport.geolocation.domain;

public record GeoPoint(double latitude, double longitude) {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public double distanceTo(GeoPoint other) {
        double latDistance = Math.toRadians(other.latitude() - this.latitude());
        double lonDistance = Math.toRadians(other.longitude() - this.longitude());
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(this.latitude())) * Math.cos(Math.toRadians(other.latitude()))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
