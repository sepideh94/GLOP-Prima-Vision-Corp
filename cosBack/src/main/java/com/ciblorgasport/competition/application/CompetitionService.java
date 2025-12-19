package com.ciblorgasport.competition.application;

import java.util.List;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.CompetitionUpdateRequest;

public interface CompetitionService {
	public CompetitionResponse createCompetition(CompetitionCreateRequest request);
	public CompetitionResponse updateCompetition(Long id, CompetitionUpdateRequest request);
	public CompetitionResponse getCompetitionById(Long id);
    public List<CompetitionResponse> getCompetitionsByEventId(Long eventId);
}
