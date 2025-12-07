package com.ciblorgasport.event.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.event.api.dto.EventCreateRequest;
import com.ciblorgasport.event.api.dto.EventUpdateRequest;
import com.ciblorgasport.event.application.EventService;
import com.ciblorgasport.event.domain.Event;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;

    @PostMapping
    public ResponseEntity<Event> create(@Valid @RequestBody EventCreateRequest req) {
        Event created = service.createFromDto(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
public ResponseEntity<Event> getById(@PathVariable("id") Long id) {
    return ResponseEntity.ok(service.getById(id));
}

@PutMapping("/{id}")
public ResponseEntity<Event> update(
        @PathVariable("id") Long id,
        @Valid @RequestBody EventUpdateRequest req
) {
    Event updated = service.updateFromDto(id, req);
    if (updated == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(updated);
}

}
