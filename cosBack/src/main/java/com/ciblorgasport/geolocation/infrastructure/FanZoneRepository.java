package com.ciblorgasport.geolocation.infrastructure;

import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FanZoneRepository extends JpaRepository<FanZone, Long> {

    List<FanZone> findByType(FanZoneType type);

    @Query("""
        SELECT fz FROM FanZone fz
        WHERE (6371 * acos(
            cos(radians(:lat)) * cos(radians(fz.latitude))
            * cos(radians(fz.longitude) - radians(:lng))
            + sin(radians(:lat)) * sin(radians(fz.latitude))
        )) <= :radiusKm
        """)
    List<FanZone> findWithinRadius(
            @Param("lat") double latitude,
            @Param("lng") double longitude,
            @Param("radiusKm") double radiusKm
    );
}
