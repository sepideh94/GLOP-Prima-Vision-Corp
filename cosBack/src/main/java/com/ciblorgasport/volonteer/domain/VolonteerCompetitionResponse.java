package com.ciblorgasport.volonteer.domain;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.athlete.dto.AthleteResponse; // Ou un VolonteerResponse si tu en as un
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VolonteerCompetitionResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private ParticipationStatus status;
    private Long competitionId; 
    private String competitionName;
}
