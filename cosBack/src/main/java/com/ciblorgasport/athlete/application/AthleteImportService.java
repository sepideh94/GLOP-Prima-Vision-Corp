package com.ciblorgasport.athlete.application;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.user.dto.CreateUserRequest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service orchestrateur pour l'import d'athlètes dans le contexte d'une compétition.
 * Gère la création des athlètes et leur invitation automatique à la compétition.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AthleteImportService {

    private final CsvImportService csvService;
    private final AthleteCreationService athleteCreationService;
    private final AthleteRepository athleteRepository;
    private final CompetitionRepository competitionRepository;
    private final ParticipationRepository participationRepository;

    private final AthleteInviteTokenService athleteInviteTokenService;
    private final AthleteInviteBatchService athleteInviteBatchService;

    @Transactional
    public ImportResult importAthletesForCompetition(MultipartFile file, Long competitionId) throws Exception {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new EntityNotFoundException("Compétition non trouvée avec l'ID: " + competitionId));

        List<CSVRecord> records = csvService.parseCsv(file);

        int created = 0;
        int invited = 0;
        int skipped = 0;

        List<AthleteInviteEmail> invitesToSend = new ArrayList<>();

        for (CSVRecord record : records) {
            try {
                Athlete athlete = getOrCreateAthlete(record);
                boolean wasInvited = inviteAthleteToCompetition(athlete, competition);

                if (wasInvited) {
                    invited++;

                    if (!athlete.isActive()) {
                        String token = athleteInviteTokenService.createInviteToken(athlete);
                        invitesToSend.add(new AthleteInviteEmail(
                                athlete.getEmail(),
                                athlete.getFirstName(),
                                token));
                    }
                } else {
                    skipped++;
                }

                created++;
            } catch (Exception e) {
                log.error("Erreur lors du traitement de la ligne CSV: {}", e.getMessage(), e);
                skipped++;
            }
        }

        if (!invitesToSend.isEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    athleteInviteBatchService.sendInvites(invitesToSend);
                }
            });
        }

        return new ImportResult(created, invited, skipped);
    }

    private Athlete getOrCreateAthlete(CSVRecord record) {
        String email = normalizeEmail(record.get("email"));

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

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    /**
     * Invite un athlète à une compétition s'il n'est pas déjà invité.
     * Règle métier : une participation n'est jamais CONFIRMED automatiquement.
     * La confirmation est réservée à la validation explicite par le commissaire.
     * Si le profil est complet + charte acceptée, la participation démarre en
     * PENDING_VALIDATION, sinon elle reste en INVITED.
     *
     * @return true si une nouvelle invitation a été créée, false si déjà invité
     */
    private boolean inviteAthleteToCompetition(Athlete athlete, Competition competition) {
        boolean alreadyExists = participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorType(
                competition.getId(),
                athlete.getId(),
                CompetitorType.ATHLETE);

        if (alreadyExists) {
            log.info("L'athlète {} est déjà invité à la compétition {}",
                    athlete.getEmail(), competition.getName());
            return false;
        }

        ParticipationStatus initialStatus = athlete.isProfileComplete()
                ? ParticipationStatus.PENDING_VALIDATION
                : ParticipationStatus.INVITED;

        Participation participation = Participation.builder()
                .competition(competition)
                .competitorId(athlete.getId())
                .competitorType(CompetitorType.ATHLETE)
                .status(initialStatus)
                .build();

        participationRepository.save(participation);

        log.info("Athlète {} ajouté à la compétition {} avec le statut {}",
                athlete.getEmail(), competition.getName(), initialStatus);

        return true;
    }

    public record ImportResult(int processed, int invited, int skipped) {}
}