package com.ciblorgasport.event.application;

import java.util.List;

import com.ciblorgasport.event.api.dto.EventCreateRequest;
import com.ciblorgasport.event.api.dto.EventUpdateRequest;
import com.ciblorgasport.event.domain.Event;

public interface EventService {
	
	public Event createFromDto(EventCreateRequest req);
	public Event updateFromDto(Long id, EventUpdateRequest req);
	public List<Event> getAll();
	public Event getById(Long id);
	 
}
