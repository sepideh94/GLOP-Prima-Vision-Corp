package com.ciblorgasport.competition.application;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;
import com.ciblorgasport.competition.dto.CompetitionResponse;
import com.ciblorgasport.competition.dto.CompetitionUpdateRequest;

public interface CompetitionService {
	public Competition createCompetition(CompetitionCreateRequest request);
	public CompetitionResponse updateCompetition(Long id, CompetitionUpdateRequest request);
}
