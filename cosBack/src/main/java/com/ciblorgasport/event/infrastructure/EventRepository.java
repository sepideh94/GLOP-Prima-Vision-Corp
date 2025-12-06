package com.ciblorgasport.event.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ciblorgasport.event.domain.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
}
