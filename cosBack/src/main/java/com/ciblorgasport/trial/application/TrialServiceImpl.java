package com.ciblorgasport.trial.application;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.dto.TrialCreateRequest;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.infrastructure.RoundRepository;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrialServiceImpl implements TrialService {

    private final TrialRepository trialRepository;
    private final SiteRepository siteRepository;
    private final CompetitionRepository competitionRepository;
    private final RoundRepository roundRepository;
    private final UserAccountRepository userAccountRepository;
    private final ParticipationRepository participationRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy à HH:mm");

    private void validateTrialDates(LocalDateTime trialStartDate, LocalDateTime trialEndDate, Competition competition) {
        LocalDateTime competitionStart = competition.getStartDate();
        LocalDateTime competitionEnd = competition.getEndDate();

        if (trialStartDate.isBefore(competitionStart)) {
            throw new IllegalArgumentException(
                "La date de début de l'épreuve (" + trialStartDate.format(DATETIME_FORMATTER) +
                ") ne peut pas être antérieure à la date de début de la compétition parent (" +
                competitionStart.format(DATETIME_FORMATTER) + ")."
            );
        }

        if (trialEndDate.isAfter(competitionEnd)) {
            throw new IllegalArgumentException(
                "La date de fin de l'épreuve (" + trialEndDate.format(DATETIME_FORMATTER) +
                ") ne peut pas être postérieure à la date de fin de la compétition parent (" +
                competitionEnd.format(DATETIME_FORMATTER) + ")."
            );
        }

        if (trialEndDate.isBefore(trialStartDate) || trialEndDate.isEqual(trialStartDate)) {
            throw new IllegalArgumentException(
                "La date et heure de fin de l'épreuve (" + trialEndDate.format(DATETIME_FORMATTER) +
                ") doit être postérieure à la date et heure de début (" +
                trialStartDate.format(DATETIME_FORMATTER) + ")."
            );
        }
    }

    @Transactional
    @Override
    public TrialResponse create(TrialCreateRequest request) {
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site introuvable avec l'ID: " + request.getSiteId()));

        Competition competition = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Compétition introuvable avec l'ID: " + request.getCompetitionId()));

        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new RuntimeException("Round introuvable avec l'ID: " + request.getRoundId()));

        LocalDateTime trialStart = LocalDateTime.of(request.getStartDate(), request.getStartHour());
        LocalDateTime trialEnd = LocalDateTime.of(request.getEndDate(), request.getEndHour());
        validateTrialDates(trialStart, trialEnd, competition);

        Trial newTrial = new Trial();

        String generatedName = request.getTrialName().getDisplayName() + " - " + round.getDisplayName();
        if (request.getRoundNumber() != null) {
            generatedName += " " + request.getRoundNumber();
        }

        newTrial.setName(generatedName);
        newTrial.setTrialName(request.getTrialName());
        newTrial.setRoundNumber(request.getRoundNumber());
        newTrial.setDescription(request.getDescription());
        newTrial.setRules(request.getRules());
        newTrial.setStartDate(request.getStartDate());
        newTrial.setStartHour(request.getStartHour());
        newTrial.setEndDate(request.getEndDate());
        newTrial.setEndHour(request.getEndHour());
        newTrial.setMode(request.getMode());
        newTrial.setCategoryGender(request.getCategoryGender());
        newTrial.setSite(site);
        newTrial.setCompetition(competition);
        newTrial.setRound(round);

        Trial savedTrial = trialRepository.save(newTrial);
        return TrialResponse.fromEntity(savedTrial);
    }

    @Transactional
    @Override
    public TrialResponse update(Long id, TrialUpdateRequest request) {
        Trial existingTrial = getTrialByIdOrThrow(id);

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site introuvable avec l'ID: " + request.getSiteId()));

        Competition competition = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Compétition introuvable avec l'ID: " + request.getCompetitionId()));

        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new RuntimeException("Round introuvable avec l'ID: " + request.getRoundId()));

        LocalDateTime trialStart = LocalDateTime.of(request.getStartDate(), request.getStartHour());
        LocalDateTime trialEnd = LocalDateTime.of(request.getEndDate(), request.getEndHour());
        validateTrialDates(trialStart, trialEnd, competition);

        String generatedName = request.getTrialName().getDisplayName() + " - " + round.getDisplayName();
        if (request.getRoundNumber() != null) {
            generatedName += " " + request.getRoundNumber();
        }

        existingTrial.setName(generatedName);
        existingTrial.setTrialName(request.getTrialName());
        existingTrial.setRoundNumber(request.getRoundNumber());
        existingTrial.setDescription(request.getDescription());
        existingTrial.setRules(request.getRules());
        existingTrial.setStartDate(request.getStartDate());
        existingTrial.setStartHour(request.getStartHour());
        existingTrial.setEndDate(request.getEndDate());
        existingTrial.setEndHour(request.getEndHour());
        existingTrial.setMode(request.getMode());
        existingTrial.setCategoryGender(request.getCategoryGender());
        existingTrial.setSite(site);
        existingTrial.setCompetition(competition);
        existingTrial.setRound(round);

        Trial updatedTrial = trialRepository.save(existingTrial);
        return TrialResponse.fromEntity(updatedTrial);
    }

    @Override
    public TrialResponse getById(Long id) {
        return TrialResponse.fromEntity(getTrialByIdOrThrow(id));
    }

    @Override
    public List<TrialResponse> getAll() {
        return trialRepository.findAll().stream()
                .map(TrialResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrialResponse> getByCompetitionId(Long competitionId) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Compétition introuvable avec l'ID: " + competitionId));

        return trialRepository.findByCompetition(competition).stream()
                .map(TrialResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TrialResponse> getTrialsForAthlete(Long competitionId, Long athleteId) {
        Participation participation = participationRepository
                .findByCompetitionIdAndCompetitorIdAndCompetitorType(
                    competitionId, 
                    athleteId, 
                    CompetitorType.ATHLETE
                )
                .orElseThrow(() -> new AccessDeniedException("Inscription non trouvée."));

        if (participation.getStatus() != ParticipationStatus.CONFIRMED) {
            throw new AccessDeniedException("Accès refusé : Profil incomplet.");
        }
        return getByCompetitionId(competitionId);
    }

    @Override
    public void delete(Long id) {
        if (!trialRepository.existsById(id)) {
            throw new RuntimeException("Épreuve introuvable avec l'ID: " + id);
        }
        trialRepository.deleteById(id);
    }

    private Trial getTrialByIdOrThrow(Long id) {
        return trialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable avec l'ID: " + id));
    }

    @Transactional
    @Override
    public TrialResponse cancelTrial(Long id, String userEmail) {
        Trial trial = getTrialByIdOrThrow(id);

        if (trial.isCancelled()) {
            throw new IllegalStateException("L'épreuve est déjà annulée.");
        }

        UserAccount user = userAccountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + userEmail));

        trial.cancel(user);

        Trial cancelledTrial = trialRepository.save(trial);
        return TrialResponse.fromEntity(cancelledTrial);
    }
}
