package com.ciblorgasport.competition.application;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.dto.ParticipantResponse;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParticipationService {

	@Autowired
    private final ParticipationRepository participationRepository;
	
	@Autowired
    private final AthleteRepository athleteRepository;

	@Autowired
	private final UserAccountRepository userAccountRepository;
	
	@Autowired
	private final PasswordEncoder passwordEncoder;
	
	
    public List<ParticipantResponse> getParticipantsByCompetition(Long competitionId) {
        List<Participation> participations = participationRepository.findByCompetitionId(competitionId);
        return buildParticipantResponses(participations);
    }

    public List<ParticipantResponse> getParticipationsByAthlete(Long athleteId) {
        List<Participation> participations = participationRepository
                .findByCompetitorIdAndCompetitorType(athleteId, CompetitorType.ATHLETE);
        return buildParticipantResponses(participations);
    }

    private List<ParticipantResponse> buildParticipantResponses(List<Participation> participations) {
        List<ParticipantResponse> responses = new ArrayList<>();

        for (Participation participation : participations) {
            ParticipantResponse.ParticipantResponseBuilder builder = ParticipantResponse.builder()
                    .participationId(participation.getId())
                    .competitorId(participation.getCompetitorId())
                    .competitorType(participation.getCompetitorType())
                    .status(participation.getStatus())
                    .competitionId(participation.getCompetition().getId())
                    .competitionName(participation.getCompetition().getName());

            if (participation.getCompetitorType() == CompetitorType.ATHLETE) {
                athleteRepository.findById(participation.getCompetitorId())
                        .ifPresent(athlete -> {
                            builder.firstName(athlete.getFirstName());
                            builder.lastName(athlete.getLastName());
                            builder.email(athlete.getEmail());
                        });
            }

            responses.add(builder.build());
        }

        return responses;
    }
    

    @Transactional
    public void validateOnboarding(String token, String newPassword, boolean charterAccepted) {

    	Participation participation = participationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new EntityNotFoundException("Invitation introuvable"));
        participation.confirm(token, charterAccepted);

       
        Athlete athlete = (Athlete) userAccountRepository.findById(participation.getCompetitorId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        athlete.setPassword(passwordEncoder.encode(newPassword));
        athlete.setActive(true); 

        participationRepository.save(participation);
        userAccountRepository.save(athlete);
    }
}
