package com.ciblorgasport.competition.application;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

import com.ciblorgasport.competition.application.exceptions.CompetitionDateIntegrityException;
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
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private void validateCompetitionDate(LocalDateTime competitionStartDate, Event parentEvent) {

        if (competitionStartDate.isBefore(parentEvent.getStartDate())) {
            throw new CompetitionDateIntegrityException(
                "La date de début de la compétition (" + competitionStartDate.format(DATE_FORMATTER) +
                ") ne peut pas être antérieure à la date de début de l'événement parent (" +
                parentEvent.getStartDate().format(DATE_FORMATTER) + ")."
            );
        }
    }

    private void validateDatesOrder(LocalDateTime startDate, LocalDateTime endDate) {
        if (endDate.isBefore(startDate)) {
            throw new CompetitionDateIntegrityException(
                "La date de fin de la compétition (" + endDate.format(DATE_FORMATTER) +
                ") ne peut pas être antérieure à la date de début (" +
                startDate.format(DATE_FORMATTER) + ")."
            );
        }
    }
    
    @Transactional
    public CompetitionResponse createCompetition(CompetitionCreateRequest request) {
        
        Event parentEvent = eventRepository.findById(request.getParentEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement parent introuvable avec l'ID: " + request.getParentEventId()));

        validateCompetitionDate(request.getStartDate(), parentEvent);
        validateDatesOrder(request.getStartDate(), request.getEndDate());
        
        Competition newCompetition = new Competition();
        newCompetition.setName(request.getName());
        newCompetition.setDescription(request.getDescription());
        newCompetition.setStartDate(request.getStartDate());
        newCompetition.setEndDate(request.getEndDate());
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
        
        Event parentEvent = existingCompetition.getParentEvent();
        validateCompetitionDate(request.getStartDate(), parentEvent);
        validateDatesOrder(request.getStartDate(), request.getEndDate());

        existingCompetition.setName(request.getName());
        existingCompetition.setDescription(request.getDescription());
        existingCompetition.setStartDate(request.getStartDate());
        existingCompetition.setEndDate(request.getEndDate());

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