package com.ciblorgasport.incident.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.incident.domain.Incident;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByEvent_Id(Long eventId);

    List<Incident> findByCompetition_Id(Long competitionId);

    List<Incident> findBySite_Id(Long siteId);

    List<Incident> findByTrial_Id(Long trialId);
}