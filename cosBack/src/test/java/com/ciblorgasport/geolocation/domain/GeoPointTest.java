package com.ciblorgasport.geolocation.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("GeoPoint — Formule de Haversine")
class GeoPointTest {

    @Test
    @DisplayName("Distance entre deux points identiques = 0 km")
    void samePoint_distanceIsZero() {
        GeoPoint a = new GeoPoint(48.8566, 2.3522);
        assertEquals(0.0, a.distanceTo(a), 0.001);
    }

    @Test
    @DisplayName("Distance Paris → Lyon ≈ 392 km")
    void parisToLyon_approximateDistance() {
        GeoPoint paris = new GeoPoint(48.8566, 2.3522);
        GeoPoint lyon  = new GeoPoint(45.7640, 4.8357);
        double distance = paris.distanceTo(lyon);
        assertTrue(distance > 385 && distance < 400,
                "Distance attendue ~392 km, obtenu: " + distance);
    }

    @Test
    @DisplayName("Distance est symétrique : A→B == B→A")
    void distance_isSymmetric() {
        GeoPoint a = new GeoPoint(48.8566, 2.3522);
        GeoPoint b = new GeoPoint(43.2965, 5.3698);
        assertEquals(a.distanceTo(b), b.distanceTo(a), 0.001);
    }

    @Test
    @DisplayName("Point dans un rayon de 5 km est détecté comme proche")
    void pointWithinRadius_isDetected() {
        GeoPoint center = new GeoPoint(48.8566, 2.3522);
        GeoPoint nearby = new GeoPoint(48.8600, 2.3600); // ~700 m
        assertTrue(center.distanceTo(nearby) <= 5.0);
    }

    @Test
    @DisplayName("Point hors rayon de 5 km est correctement exclu")
    void pointOutsideRadius_isExcluded() {
        GeoPoint center = new GeoPoint(48.8566, 2.3522);
        GeoPoint far    = new GeoPoint(45.7640, 4.8357); // Lyon
        assertFalse(center.distanceTo(far) <= 5.0);
    }
}
