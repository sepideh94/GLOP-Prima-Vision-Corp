package com.ciblorgasport.trial.round.application;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.dto.RoundCreateRequest;
import com.ciblorgasport.trial.round.dto.RoundResponse;
import com.ciblorgasport.trial.round.infrastructure.RoundRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoundServiceImpl implements RoundService {

    private final RoundRepository roundRepository;

    @Transactional
    @Override
    public RoundResponse create(RoundCreateRequest request) {
        // Check if this round type already exists
        boolean exists = roundRepository.findAll().stream()
                .anyMatch(r -> r.getName() == request.getName());

        if (exists) {
            throw new RuntimeException(
                "Un round de type " + request.getName().getDisplayName() + " existe déjà.");
        }

        Round newRound = new Round();
        newRound.setName(request.getName());

        Round savedRound = roundRepository.save(newRound);
        return RoundResponse.fromEntity(savedRound);
    }

    @Override
    public RoundResponse getById(Long id) {
        Round round = getRoundByIdOrThrow(id);
        return RoundResponse.fromEntity(round);
    }

    @Override
    public List<RoundResponse> getAll() {
        return roundRepository.findAll().stream()
                .map(RoundResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void delete(Long id) {
        if (!roundRepository.existsById(id)) {
            throw new RuntimeException("Round introuvable avec l'ID: " + id);
        }
        roundRepository.deleteById(id);
    }

    private Round getRoundByIdOrThrow(Long id) {
        return roundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Round introuvable avec l'ID: " + id));
    }
}
