package com.ciblorgasport.incident.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByImpactLevel(ImpactLevel impactLevel);

    List<Incident> findByEvent_Id(Long eventId);

    List<Incident> findByCompetition_Id(Long competitionId);

    List<Incident> findBySite_Id(Long siteId);

    List<Incident> findByTrial_Id(Long trialId);

    List<Incident> findByEvent_IdAndImpactLevel(Long eventId, ImpactLevel impactLevel);

    List<Incident> findByEvent_IdAndCompetition_Id(Long eventId, Long competitionId);

    List<Incident> findByEvent_IdAndSite_Id(Long eventId, Long siteId);

    List<Incident> findByEvent_IdAndTrial_Id(Long eventId, Long trialId);
}