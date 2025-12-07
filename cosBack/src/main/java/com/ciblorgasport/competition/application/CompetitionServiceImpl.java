package com.ciblorgasport.competition.application;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.CompetitionUpdateRequest;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.domain.exception.EventNotFoundException;
import com.ciblorgasport.event.infrastructure.EventRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompetitionServiceImpl implements CompetitionService{

    private final CompetitionRepository competitionRepository;
    private final EventRepository eventRepository;

    
    @Transactional
    public CompetitionResponse createCompetition(CompetitionCreateRequest request) {
        
        Event parentEvent = eventRepository.findById(request.getParentEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement parent introuvable avec l'ID: " + request.getParentEventId()));

        Competition newCompetition = new Competition();
        newCompetition.setName(request.getName());
        newCompetition.setDescription(request.getDescription());
        newCompetition.setStartDate(request.getStartDate());
        newCompetition.setParentEvent(parentEvent);
        
        Competition savedCompetition = competitionRepository.save(newCompetition);
        
        return CompetitionResponse.fromEntity(savedCompetition);
    }

    
    private Competition getCompetitionByIdOrThrow(Long id) {
        return competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compétition introuvable avec l'ID: " + id));
    }

    @Transactional
    @Override
    public CompetitionResponse updateCompetition(Long id, CompetitionUpdateRequest request) {
        Competition existingCompetition = getCompetitionByIdOrThrow(id);

        existingCompetition.setName(request.getName());
        existingCompetition.setDescription(request.getDescription());
        existingCompetition.setStartDate(request.getStartDate());
        
        Competition updatedCompetition = competitionRepository.save(existingCompetition);
        
        return CompetitionResponse.fromEntity(updatedCompetition);    }


	@Override
	public CompetitionResponse getCompetitionById(Long id) {
		return CompetitionResponse.fromEntity(this.getCompetitionByIdOrThrow(id));
	}


	@Override
    public List<CompetitionResponse> getCompetitionsByEventId(Long eventId) {
        
        Event parentEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId)); 
                
        List<Competition> competitions = competitionRepository.findByParentEvent(parentEvent);
        
        return competitions.stream()
            .map(CompetitionResponse::fromEntity)
            .collect(Collectors.toList());
    }


}