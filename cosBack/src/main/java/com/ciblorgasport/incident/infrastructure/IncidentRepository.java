package com.ciblorgasport.incident.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByImpactLevel(ImpactLevel impactLevel);

    List<Incident> findByCompetition_Id(Long competitionId);

    List<Incident> findBySite_Id(Long siteId);

    List<Incident> findByCompetition_IdAndImpactLevel(Long competitionId, ImpactLevel impactLevel);

    List<Incident> findBySite_IdAndImpactLevel(Long siteId, ImpactLevel impactLevel);

    List<Incident> findByCompetition_IdAndSite_Id(Long competitionId, Long siteId);

    List<Incident> findByCompetition_IdAndSite_IdAndImpactLevel(Long competitionId, Long siteId, ImpactLevel impactLevel);
}