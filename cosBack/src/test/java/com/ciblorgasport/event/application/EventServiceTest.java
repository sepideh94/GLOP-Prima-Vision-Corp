package com.ciblorgasport.event.application;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ciblorgasport.event.api.dto.EventCreateRequest;
import com.ciblorgasport.event.api.dto.EventUpdateRequest;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.domain.exception.EventNotFoundException;
import com.ciblorgasport.event.infrastructure.EventRepository;

public class EventServiceTest {

    private EventRepository repository;
    private EventServiceImpl service;

    @BeforeEach
    void setup() {
        repository = Mockito.mock(EventRepository.class);
        service = new EventServiceImpl(repository);
    }

    @Test
    void createEvent_shouldSaveEvent() {
        EventCreateRequest req = new EventCreateRequest();
        req.setName("Test Event");
        req.setDescription("desc");
        req.setStartDate(LocalDateTime.now());
        req.setEndDate(LocalDateTime.now().plusDays(1));

        when(repository.save(any(Event.class))).thenAnswer(inv -> inv.getArgument(0));

        Event result = service.createFromDto(req);

        assertEquals("Test Event", result.getName());
        assertNotNull(result.getEndDate());
        verify(repository, times(1)).save(any(Event.class));
    }

    @Test
    void getById_shouldReturnEvent() {
        Event event = new Event();
        event.setId(10L);
        when(repository.findById(10L)).thenReturn(Optional.of(event));

        Event result = service.getById(10L);

        assertEquals(10L, result.getId());
    }

    @Test
    void getById_shouldThrowException_WhenNotFound() {
        when(repository.findById(any())).thenReturn(Optional.empty());

        assertThrows(EventNotFoundException.class, () -> service.getById(999L));
    }

    @Test
    void updateEvent_shouldUpdateFields() {
        Event existing = new Event();
        existing.setId(5L);
        existing.setName("Old Name");

        EventUpdateRequest req = new EventUpdateRequest();
        req.setName("New Name");
        req.setDescription("New Desc");
        req.setStartDate(LocalDateTime.now());
        req.setEndDate(LocalDateTime.now().plusDays(2));

        when(repository.findById(5L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Event.class))).thenAnswer(inv -> inv.getArgument(0));

        Event updated = service.updateFromDto(5L, req);

        assertEquals("New Name", updated.getName());
        assertEquals("New Desc", updated.getDescription());
        assertNotNull(updated.getEndDate());
    }
}
