package com.ciblorgasport.geolocation.application.port;

import java.util.List;

public interface GeoLocationService {

    /**
     * Recherche des lieux d'intérêt à proximité (bars, places publiques, etc.)
     */
    List<NearbyPlace> searchNearbyPlaces(double latitude, double longitude, double radiusKm, String keyword);

    /**
     * Géocode une adresse pour obtenir ses coordonnées GPS.
     */
    GeoCoordinates geocodeAddress(String address);

    /**
     * Calcule un itinéraire entre deux points GPS.
     */
    RouteInfo calculateRoute(double fromLat, double fromLng, double toLat, double toLng, TravelMode mode);

    /**
     * Récupère les détails d'un lieu via son Google Place ID.
     */
    NearbyPlace getPlaceDetails(String placeId);
}
