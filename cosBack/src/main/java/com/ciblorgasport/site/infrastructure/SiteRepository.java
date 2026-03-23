package com.ciblorgasport.site.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ciblorgasport.site.domain.Site;

public interface SiteRepository extends JpaRepository<Site, Long> {

    Optional<Site> findFirstByAdressIgnoreCase(String adress);

    @Query("""
        SELECT s FROM Site s
        WHERE s.latitude BETWEEN :latMin AND :latMax
        AND s.longitude BETWEEN :lngMin AND :lngMax
        """)
    List<Site> findInBoundingBox(
            @Param("latMin") double latMin,
            @Param("latMax") double latMax,
            @Param("lngMin") double lngMin,
            @Param("lngMax") double lngMax);
}
