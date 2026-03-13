package com.ciblorgasport.team.application;

import java.util.List;
import java.util.UUID;

import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.athlete.application.AthleteCreationService;
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

    /**
     * Importe des équipes et leurs membres depuis un CSV.
     * Format attendu : teamName, firstName, lastName, email
     */
    @Transactional
    public TeamImportResult importTeamsForCompetition(MultipartFile file, Long competitionId) throws Exception {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new EntityNotFoundException("Compétition non trouvée avec l'ID: " + competitionId));

        List<CSVRecord> records = csvService.parseCsv(file);
        int teamsProcessed = 0;
        int athletesCreated = 0;
        int skipped = 0;

        for (CSVRecord record : records) {
            try {
                String teamName = record.get("teamName").trim();
                String email = record.get("email").trim().toLowerCase();

                boolean isNewAthlete = !athleteRepository.existsByEmail(email);
                Athlete athlete = getOrCreateAthlete(record);
                if (isNewAthlete) athletesCreated++;

                Team team = teamRepository.findByName(teamName)
                        .orElseGet(() -> {
                            Team newTeam = Team.builder().name(teamName).build();
                            return teamRepository.save(newTeam);
                        });

                if (!team.getMembers().contains(athlete)) {
                    team.addMember(athlete);
                    teamRepository.save(team);
                }

                inviteTeamToCompetition(team, competition);
                
                teamsProcessed++;
            } catch (Exception e) {
                log.error("Erreur lors du traitement d'une ligne d'équipe : {}", e.getMessage());
                skipped++;
            }
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
        boolean alreadyExists = participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorType(
                competition.getId(), team.getId(), CompetitorType.TEAM);

        if (!alreadyExists) {
            Participation participation = Participation.builder()
                    .competition(competition)
                    .competitorId(team.getId())
                    .competitorType(CompetitorType.TEAM)
                    .status(ParticipationStatus.CONFIRMED)
                    .build();
            participationRepository.save(participation);
            log.info("Équipe {} inscrite à la compétition {}", team.getName(), competition.getName());
        }
    }
}