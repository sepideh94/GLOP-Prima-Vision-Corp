package com.ciblorgasport.event.application;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ciblorgasport.event.api.dto.EventCreateRequest;
import com.ciblorgasport.event.api.dto.EventUpdateRequest;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.domain.exception.EventNotFoundException;
import com.ciblorgasport.event.infrastructure.EventRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {
	
	@Autowired
    private final EventRepository repository;
    
    @Override
    public Event createFromDto(EventCreateRequest req) {
    Event e = new Event();
    e.setName(req.getName());
    e.setDescription(req.getDescription());
    e.setStartDate(req.getStartDate());
    e.setEndDate(req.getEndDate());   

    return repository.save(e);
}

    @Override
    public Event updateFromDto(Long id, EventUpdateRequest req) {
    Event existing = repository.findById(id)
            .orElseThrow(() -> new EventNotFoundException(id));

    existing.setName(req.getName());
    existing.setDescription(req.getDescription());
    existing.setStartDate(req.getStartDate());

    if (req.getEndDate() != null) {
        existing.setEndDate(req.getEndDate()); 
    }

    return repository.save(existing);
}

    @Override
    public List<Event> getAll() {
        return repository.findAll();
    }
    
    @Override
    public Event getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
    }
}
