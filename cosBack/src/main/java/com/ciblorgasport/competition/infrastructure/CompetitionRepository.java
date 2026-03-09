package com.ciblorgasport.competition.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.event.domain.Event;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
	List<Competition> findByParentEvent(Event parentEvent);

	List<Competition> findByParentEventId(Long eventId);
}