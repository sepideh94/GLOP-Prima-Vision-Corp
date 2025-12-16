package com.ciblorgasport.trial.application;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.round.domain.Round;
import com.ciblorgasport.round.infrastructure.RoundRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.dto.TrialCreateRequest;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;
import com.ciblorgasport.trial.infrastructure.TrialRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrialServiceImpl implements TrialService {

    private final TrialRepository trialRepository;
    private final SiteRepository siteRepository;
    private final CompetitionRepository competitionRepository;
    private final RoundRepository roundRepository;

    @Transactional
    @Override
    public TrialResponse create(TrialCreateRequest request) {
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site introuvable avec l'ID: " + request.getSiteId()));

        Competition competition = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Compétition introuvable avec l'ID: " + request.getCompetitionId()));

        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new RuntimeException("Round introuvable avec l'ID: " + request.getRoundId()));

        Trial newTrial = new Trial();

        // Generate name: trialName + roundName + optional roundNumber
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

        // Generate name: trialName + roundName + optional roundNumber
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
}
