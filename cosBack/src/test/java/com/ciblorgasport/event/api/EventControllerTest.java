package com.ciblorgasport.event.api;

import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.event.api.dto.EventCreateRequest;
import com.ciblorgasport.event.api.dto.EventUpdateRequest;
import com.ciblorgasport.event.application.EventService;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.user.application.UserAccountService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
@Import(SecurityDisabledConfig.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService service;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserAccountService userAccountService;

    private Event sampleEvent(Long id) {
        Event e = new Event();
        e.setId(id);
        e.setName("Event " + id);
        e.setDescription("Desc " + id);
        e.setStartDate(LocalDateTime.of(2025, 1, 1, 10, 0));
        e.setEndDate(LocalDateTime.of(2025, 1, 1, 12, 0));
        return e;
    }

    @Test
    void getAll_shouldReturn200AndList() throws Exception {
        List<Event> events = List.of(sampleEvent(1L), sampleEvent(2L));
        given(service.getAll()).willReturn(events);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Event 1"));

        verify(service).getAll();
    }

    @Test
    void getById_shouldReturn200AndEvent() throws Exception {
        Event event = sampleEvent(1L);
        given(service.getById(1L)).willReturn(event);

        mockMvc.perform(get("/api/events/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Event 1"));

        verify(service).getById(1L);
    }

    @Test
    void create_shouldReturn201AndBody() throws Exception {
        Event created = sampleEvent(10L);

        given(service.createFromDto(any(EventCreateRequest.class)))
                .willReturn(created);

        String jsonBody = """
                {
                  "name": "New Event",
                  "description": "New desc",
                  "startDate": "2025-01-01T10:00:00",
                  "endDate": "2025-01-01T12:00:00"
                }
                """;

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.name").value("Event 10"));

        verify(service).createFromDto(any(EventCreateRequest.class));
    }

    @Test
    void update_shouldReturn200WhenFound() throws Exception {
        Event updated = sampleEvent(5L);

        given(service.updateFromDto(eq(5L), any(EventUpdateRequest.class)))
                .willReturn(updated);

        String jsonBody = """
                {
                  "name": "Updated Event",
                  "description": "Updated desc",
                  "startDate": "2025-01-01T10:00:00",
                  "endDate": "2025-01-01T12:00:00"
                }
                """;

        mockMvc.perform(put("/api/events/{id}", 5L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L));

        verify(service).updateFromDto(eq(5L), any(EventUpdateRequest.class));
    }

    @Test
    void update_shouldReturn404WhenNotFound() throws Exception {
        given(service.updateFromDto(eq(999L), any(EventUpdateRequest.class)))
                .willReturn(null);

        String jsonBody = """
                {
                  "name": "Updated Event",
                  "description": "Updated desc",
                  "startDate": "2025-01-01T10:00:00",
                  "endDate": "2025-01-01T12:00:00"
                }
                """;

        mockMvc.perform(put("/api/events/{id}", 999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isNotFound());

        verify(service).updateFromDto(eq(999L), any(EventUpdateRequest.class));
    }
}
