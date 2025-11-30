package com.ciblorgasport.competitions.application;

import com.ciblorgasport.competitions.domain.Competition;
import com.ciblorgasport.competitions.dto.CompetitionCreateRequest; 
import com.ciblorgasport.competitions.dto.CompetitionUpdateRequest;
import com.ciblorgasport.competitions.infrastructure.CompetitionRepository;
import com.ciblorgasport.competitions.infrastructure.EventRepository; 
import com.ciblorgasport.competitions.domain.Event; 
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompetitionService {

    private final CompetitionRepository competitionRepository;
    private final EventRepository eventRepository;

    /**
     * Crée une nouvelle compétition liée à un événement parent.
     */
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