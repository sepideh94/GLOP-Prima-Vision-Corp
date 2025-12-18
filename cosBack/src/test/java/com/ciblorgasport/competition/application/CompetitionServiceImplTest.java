package com.ciblorgasport.competition.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.competition.application.exceptions.CompetitionDateIntegrityException;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;

@ExtendWith(MockitoExtension.class)
class CompetitionServiceImplTest {

    @Mock
    private CompetitionRepository competitionRepository;
    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private CompetitionServiceImpl competitionService;

    private Event parentEvent;
    private CompetitionCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        parentEvent = new Event();
        parentEvent.setId(1L);
        parentEvent.setStartDate(LocalDateTime.of(2025, 6, 1, 10, 0));

        createRequest = new CompetitionCreateRequest();
        createRequest.setParentEventId(1L);
        createRequest.setName("Tournoi de Judo");
        createRequest.setStartDate(LocalDateTime.of(2025, 6, 2, 10, 0)); 
        createRequest.setEndDate(LocalDateTime.of(2025, 6, 3, 10, 0));
    }

    @Test
    void createCompetition_ShouldThrowException_WhenStartDateIsBeforeEventStartDate() {

    	createRequest.setStartDate(LocalDateTime.of(2025, 5, 30, 10, 0));
        
        when(eventRepository.findById(1L)).thenReturn(Optional.of(parentEvent));

        assertThrows(CompetitionDateIntegrityException.class, () -> {
            competitionService.createCompetition(createRequest);
        });
    }

    @Test
    void createCompetition_ShouldThrowException_WhenEndDateIsBeforeStartDate() {
        
        createRequest.setEndDate(LocalDateTime.of(2025, 6, 1, 10, 0));
        
        when(eventRepository.findById(1L)).thenReturn(Optional.of(parentEvent));

        assertThrows(CompetitionDateIntegrityException.class, () -> {
            competitionService.createCompetition(createRequest);
        });
    }
}