package com.ciblorgasport.geolocation.util;

import java.util.ArrayList;
import java.util.List;

/** Décode la chaîne `overview_polyline.points` de l’API Directions Google. */
public final class EncodedPolylineDecoder {

    private EncodedPolylineDecoder() {}

    public static List<double[]> decode(String encoded) {
        if (encoded == null || encoded.isEmpty()) return List.of();
        List<double[]> path = new ArrayList<>();
        int index = 0;
        int lat = 0;
        int lng = 0;
        while (index < encoded.length()) {
            int b;
            int shift = 0;
            int result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;
            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;
            path.add(new double[]{lat / 1e5, lng / 1e5});
        }
        return path;
    }
}
