package com.ciblorgasport.competition.application;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.dto.AthleteCompetitionDetailsResponse;
import com.ciblorgasport.competition.dto.ParticipantResponse;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final AthleteRepository athleteRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public List<ParticipantResponse> getParticipantsByCompetition(Long competitionId) {
        List<Participation> participations = participationRepository.findByCompetition_Id(competitionId);
        return buildParticipantResponses(participations);
    }

    @Transactional
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
    public List<AthleteCompetitionDetailsResponse> getAthleteDashboardCards(Long athleteId) {
        return participationRepository
                .findByCompetitorIdAndCompetitorType(athleteId, CompetitorType.ATHLETE)
                .stream()
                .map(AthleteCompetitionDetailsResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void confirmParticipation(Long participationId, Long athleteId) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new EntityNotFoundException("Participation introuvable"));

        if (!participation.getCompetitorId().equals(athleteId)) {
            throw new AccessDeniedException("Accès non autorisé");
        }

        participation.confirmCharter();
        participationRepository.save(participation);
    }
}