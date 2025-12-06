package com.ciblorgasport.competition.application;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.dto.CompetitionCreateRequest;

public interface CompetitionService {
	public Competition createCompetition(CompetitionCreateRequest request);
}
