package com.ciblorgasport.trial.application;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.CategoryGender;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialName;
import com.ciblorgasport.trial.dto.TrialCreateRequest;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;
import com.ciblorgasport.trial.round.infrastructure.RoundRepository;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Valide que tous les trials du round précédent sont terminés
     * avant la date de début du nouveau trial.
     */
    private void validatePreviousRoundCompleted(
            Competition competition,
            TrialName trialName,
            CategoryGender categoryGender,
            LocalDateTime newTrialStart,
            RoundName previousRoundName,
            String previousRoundLabel) {

        List<Trial> previousRoundTrials = trialRepository
            .findActiveByCompetitionAndTrialNameAndCategoryGenderAndRoundName(
                competition, trialName, categoryGender, previousRoundName);

        if (previousRoundTrials.isEmpty()) {
            throw new IllegalArgumentException(
                "Aucune " + previousRoundLabel
                + " n'existe pour cette épreuve. "
                + "Veuillez d'abord créer les "
                + previousRoundLabel + ".");
        }

        for (Trial prevTrial : previousRoundTrials) {
            if (prevTrial.getEndDate() == null || prevTrial.getEndHour() == null) {
                throw new IllegalArgumentException(
                    "La série \"" + prevTrial.getName()
                    + "\" n'a pas de date de fin définie.");
            }

            LocalDateTime prevEnd = LocalDateTime.of(
                prevTrial.getEndDate(), prevTrial.getEndHour());

            if (newTrialStart.isBefore(prevEnd) || newTrialStart.isEqual(prevEnd)) {
                throw new IllegalArgumentException(
                    "La date de début de l'épreuve doit être postérieure "
                    + "à la fin de toutes les " + previousRoundLabel
                    + ". La série \"" + prevTrial.getName()
                    + "\" se termine le "
                    + prevEnd.format(DATETIME_FORMATTER) + ".");
            }
        }
    }

    @Transactional
    @Override
    public TrialResponse create(TrialCreateRequest request) {
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site introuvable avec l'ID: " + request.getSiteId()));

        Competition competition = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Compétition introuvable avec l'ID: " + request.getCompetitionId()));

        // Résoudre le round : roundId > roundName > défaut QUALIFICATION_HEAT
        Round round;
        if (request.getRoundId() != null) {
            round = roundRepository.findById(request.getRoundId())
                    .orElseThrow(() -> new RuntimeException("Round introuvable avec l'ID: " + request.getRoundId()));
        } else if (request.getRoundName() != null && !request.getRoundName().isBlank()) {
            RoundName requestedRound;
            try {
                requestedRound = RoundName.valueOf(request.getRoundName());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Phase invalide : " + request.getRoundName());
            }
            round = roundRepository.findByName(requestedRound)
                    .orElseThrow(() -> new RuntimeException("Round introuvable : " + request.getRoundName()));
        } else {
            round = roundRepository.findByName(RoundName.QUALIFICATION_HEAT)
                    .orElseThrow(() -> new RuntimeException("Round QUALIFICATION_HEAT introuvable en base de données."));
        }

        LocalDateTime trialStart = LocalDateTime.of(request.getStartDate(), request.getStartHour());
        LocalDateTime trialEnd = LocalDateTime.of(request.getEndDate(), request.getEndHour());
        validateTrialDates(trialStart, trialEnd, competition);

        // Round-specific validation and auto-generation
        RoundName roundName = round.getName();
        Integer roundNumber = null;

        if (roundName == RoundName.QUALIFICATION_HEAT) {
            // Auto-generate roundNumber: MAX(existing) + 1, starting at 1
            Integer maxRoundNumber = trialRepository.findMaxRoundNumber(
                competition, request.getTrialName(), request.getCategoryGender(), request.getMode(), round);
            roundNumber = (maxRoundNumber != null) ? maxRoundNumber + 1 : 1;

        } else if (roundName == RoundName.DEMI_FINALE) {
            validatePreviousRoundCompleted(
                competition, request.getTrialName(), request.getCategoryGender(),
                trialStart, RoundName.QUALIFICATION_HEAT, "qualifications");

        } else if (roundName == RoundName.FINALE) {
            validatePreviousRoundCompleted(
                competition, request.getTrialName(), request.getCategoryGender(),
                trialStart, RoundName.DEMI_FINALE, "demi-finales");
        }

        Trial newTrial = new Trial();

        String generatedName = request.getTrialName().getDisplayName() + " - " + round.getDisplayName();
        if (roundNumber != null) {
            generatedName += " " + roundNumber;
        }

        newTrial.setName(generatedName);
        newTrial.setTrialName(request.getTrialName());
        newTrial.setRoundNumber(roundNumber);
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

        // Si roundId fourni, l'utiliser ; sinon, conserver le round existant
        Round round;
        if (request.getRoundId() != null) {
            round = roundRepository.findById(request.getRoundId())
                    .orElseThrow(() -> new RuntimeException("Round introuvable avec l'ID: " + request.getRoundId()));
        } else {
            round = existingTrial.getRound();
        }

        LocalDateTime trialStart = LocalDateTime.of(request.getStartDate(), request.getStartHour());
        LocalDateTime trialEnd = LocalDateTime.of(request.getEndDate(), request.getEndHour());
        validateTrialDates(trialStart, trialEnd, competition);

        String generatedName = request.getTrialName().getDisplayName() + " - " + round.getDisplayName();
        if (existingTrial.getRoundNumber() != null) {
            generatedName += " " + existingTrial.getRoundNumber();
        }

        existingTrial.setName(generatedName);
        existingTrial.setTrialName(request.getTrialName());
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

    @Transactional(readOnly = true)
    @Override
    public TrialResponse getById(Long id) {
        Trial trial = trialRepository.findOneWithAssociationsById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Épreuve introuvable avec l'ID: " + id));
        return TrialResponse.fromEntity(trial);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TrialResponse> getAll() {
        return trialRepository.findAllWithAssociations().stream()
                .map(TrialResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<TrialResponse> getByCompetitionId(Long competitionId) {
        if (!competitionRepository.existsById(competitionId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Compétition introuvable avec l'ID: " + competitionId);
        }
        return trialRepository.findByCompetitionId(competitionId).stream()
                .map(TrialResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
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

    @Transactional
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

    @Transactional(readOnly = true)
    @Override
    public List<TrialResponse> getTrialsBySiteAndPeriod(Long siteId, LocalDateTime start, LocalDateTime end) {
        return trialRepository.findBySiteAndPeriod(
                siteId, 
                start.toLocalDate(), 
                start.toLocalTime(), 
                end.toLocalDate(), 
                end.toLocalTime()
        ).stream()
        .map(TrialResponse::fromEntity)
        .collect(Collectors.toList());
    }
    
}
