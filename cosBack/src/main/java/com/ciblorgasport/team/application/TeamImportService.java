package com.ciblorgasport.team.application;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.athlete.application.AthleteCreationService;
import com.ciblorgasport.athlete.application.AthleteInviteBatchService;
import com.ciblorgasport.athlete.application.AthleteInviteEmail;
import com.ciblorgasport.athlete.application.AthleteInviteTokenService;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.dto.TeamImportResult;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import com.ciblorgasport.user.dto.CreateUserRequest;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamImportService {

    private final CsvImportService csvService;
    private final TeamRepository teamRepository;
    private final AthleteRepository athleteRepository;
    private final AthleteCreationService athleteCreationService;
    private final CompetitionRepository competitionRepository;
    private final ParticipationRepository participationRepository;
    private final AthleteInviteTokenService athleteInviteTokenService;
    private final AthleteInviteBatchService athleteInviteBatchService;
   
    
    /**
     * Importe des équipes et leurs membres depuis un CSV.
     * Format attendu : teamName, firstName, lastName, email
     */
    @Transactional
    public TeamImportResult importTeamsForCompetition(MultipartFile file, Long competitionId) throws Exception {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new EntityNotFoundException("Compétition non trouvée"));

        List<CSVRecord> records = csvService.parseCsv(file);
        int teamsProcessed = 0;
        int athletesCreated = 0;
        int skipped = 0;

        List<AthleteInviteEmail> invitesToSend = new ArrayList<>();

        for (CSVRecord record : records) {
            try {
                String teamName = record.get("teamName").trim();
                String email = record.get("email").trim().toLowerCase();

                boolean isNew = !athleteRepository.existsByEmail(email);
                Athlete athlete = getOrCreateAthlete(record);

                if (isNew) {
                    athletesCreated++;
                    String token = athleteInviteTokenService.createInviteToken(athlete);
                    invitesToSend.add(new AthleteInviteEmail(athlete.getEmail(), athlete.getFirstName(), token));
                }

                Team team = teamRepository.findByName(teamName)
                        .orElseGet(() -> teamRepository.save(Team.builder().name(teamName).build()));

                if (!team.getMembers().contains(athlete)) {
                    team.addMember(athlete);
                    teamRepository.save(team);
                }

                inviteAthleteToCompetition(athlete, competition);

                inviteTeamToCompetition(team, competition);
                
                teamsProcessed++;
            } catch (Exception e) {
                log.error("Erreur ligne CSV : {}", e.getMessage());
                skipped++;
            }
        }

        // Envoi groupé des mails après succès de la transaction
        if (!invitesToSend.isEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    athleteInviteBatchService.sendInvites(invitesToSend);
                }
            });
        }

        return new TeamImportResult(teamsProcessed, athletesCreated, skipped);
    }

    private Athlete getOrCreateAthlete(CSVRecord record) {
        String email = record.get("email").trim().toLowerCase();
        return athleteRepository.findByEmail(email)
                .orElseGet(() -> {
                    String tempPassword = UUID.randomUUID().toString().substring(0, 8);
                    CreateUserRequest request = CreateUserRequest.builder()
                            .email(email)
                            .firstName(record.get("firstName"))
                            .lastName(record.get("lastName"))
                            .password(tempPassword)
                            .build();
                    return (Athlete) athleteCreationService.createUser(request);
                });
    }

    private void inviteTeamToCompetition(Team team, Competition competition) {
        boolean alreadyInvited = participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorType(
                competition.getId(), team.getId(), CompetitorType.TEAM);

        if (!alreadyInvited) {
            Participation participation = Participation.builder()
                    .competition(competition)
                    .competitorId(team.getId())
                    .competitorType(CompetitorType.TEAM)
                    .status(ParticipationStatus.INVITED)
                    .charterAccepted(false)
                    .build();
            participationRepository.save(participation);
        }
    }
    private void inviteAthleteToCompetition(Athlete athlete, Competition competition) {
        boolean alreadyInvited = participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorType(
                competition.getId(), athlete.getId(), CompetitorType.ATHLETE);

        if (!alreadyInvited) {
            Participation participation = Participation.builder()
                    .competition(competition)
                    .competitorId(athlete.getId())
                    .competitorType(CompetitorType.ATHLETE)
                    .status(athlete.isProfileComplete() ? ParticipationStatus.CONFIRMED : ParticipationStatus.INVITED)
                    .charterAccepted(false)
                    .build();
            participationRepository.save(participation);
        }
    }
}