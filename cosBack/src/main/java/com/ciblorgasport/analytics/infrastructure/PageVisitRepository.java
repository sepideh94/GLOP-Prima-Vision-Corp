package com.ciblorgasport.analytics.infrastructure;

import com.ciblorgasport.analytics.domain.PageVisit;
import com.ciblorgasport.analytics.dto.SectionVisitCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PageVisitRepository extends JpaRepository<PageVisit, Long> {

    @Query("SELECT p.section AS section, COUNT(p) AS visitCount FROM PageVisit p GROUP BY p.section ORDER BY visitCount DESC")
    List<SectionVisitCount> findMostConsultedSections();

    @Query("SELECT p.section AS section, COUNT(p) AS visitCount FROM PageVisit p WHERE p.userRole = :role GROUP BY p.section ORDER BY visitCount DESC")
    List<SectionVisitCount> findMostConsultedSectionsByRole(@Param("role") String role);
}
