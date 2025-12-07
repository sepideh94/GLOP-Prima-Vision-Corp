package com.ciblorgasport.competition.api;

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

import com.ciblorgasport.competition.application.CompetitionService;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.CompetitionUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/competitions")
@RequiredArgsConstructor
public class CompetitionController {
	
	
	private final CompetitionService competitionService;

  
	@PostMapping
    public ResponseEntity<CompetitionResponse> createCompetition(@Valid @RequestBody CompetitionCreateRequest request) {
        CompetitionResponse newCompetition = competitionService.createCompetition(request);
        return new ResponseEntity<>(newCompetition, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CompetitionResponse> updateCompetition(@PathVariable("id") Long id, // CHANGEMENT DE RETOUR
                                                        @Valid @RequestBody CompetitionUpdateRequest request) {
        CompetitionResponse updatedCompetition = competitionService.updateCompetition(id, request);
        return ResponseEntity.ok(updatedCompetition);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CompetitionResponse> getCompetitionById(@PathVariable("id") Long id) {
        CompetitionResponse competition = competitionService.getCompetitionById(id);
        return ResponseEntity.ok(competition);
    }
    
   
    @GetMapping("/by-event/{eventId}")
    public ResponseEntity<List<CompetitionResponse>> getCompetitionsByEventId(@PathVariable("eventId") Long eventId) {
        List<CompetitionResponse> competitions = competitionService.getCompetitionsByEventId(eventId);
        return ResponseEntity.ok(competitions);
    }
}
