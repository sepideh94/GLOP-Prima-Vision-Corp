package com.ciblorgasport.event.application;

import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
    }

    public Event updateEvent(Long id, Event updatedEvent) {
        Event existing = getEventById(id);

        existing.setName(updatedEvent.getName());
        existing.setDescription(updatedEvent.getDescription());
        existing.setStartDate(updatedEvent.getStartDate());

        return eventRepository.save(existing);
    }
}
