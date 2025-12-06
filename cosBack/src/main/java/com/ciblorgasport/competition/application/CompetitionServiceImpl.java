package com.ciblorgasport.competition.application;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest; 
import com.ciblorgasport.competition.dto.CompetitionUpdateRequest;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompetitionServiceImpl implements CompetitionService{

    private final CompetitionRepository competitionRepository;
    private final EventRepository eventRepository;

    
    @Transactional
    public Competition createCompetition(CompetitionCreateRequest request) {
        
        Event parentEvent = eventRepository.findById(request.getParentEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement parent introuvable avec l'ID: " + request.getParentEventId()));

        Competition newCompetition = new Competition();
        newCompetition.setName(request.getName());
        newCompetition.setDescription(request.getDescription());
        newCompetition.setStartDate(request.getStartDate());
        newCompetition.setParentEvent(parentEvent);

        return competitionRepository.save(newCompetition);
    }


}