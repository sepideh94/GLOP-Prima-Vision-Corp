package com.ciblorgasport.event.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.event.domain.Event;

public interface EventRepository extends JpaRepository<Event, Long> {}
