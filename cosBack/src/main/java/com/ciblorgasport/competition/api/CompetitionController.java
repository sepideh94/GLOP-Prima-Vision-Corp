package com.ciblorgasport.competition.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.competition.application.CompetitionService;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/competitions")
@RequiredArgsConstructor
public class CompetitionController {
	
	
	private final CompetitionService competitionService;

  
    @PostMapping
    public ResponseEntity<Competition> createCompetition(@Valid @RequestBody CompetitionCreateRequest request) {
        Competition newCompetition = competitionService.createCompetition(request);
        return new ResponseEntity<>(newCompetition, HttpStatus.CREATED);
    }
}
