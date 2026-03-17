package com.ciblorgasport.schedule.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.volonteer.domain.Volonteer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerScheduleSummary{
		String title;	
	    String competitionName;
	    LocalDateTime missionStart;
	    LocalDateTime missionEnd;
	    String siteAddress;
	    String assignmentStatus;
	    List<String> occurringTrialNames; 
}

