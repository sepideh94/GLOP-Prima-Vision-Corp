package com.ciblorgasport.spectator.application;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.spectator.CompetitionFollow;
import com.ciblorgasport.spectator.dto.CompetitionFollowResponse;
import com.ciblorgasport.spectator.infrastructure.CompetitionFollowRepository;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CompetitionFollowServiceImpl implements CompetitionFollowService {

    private final CompetitionFollowRepository competitionFollowRepository;
    private final CompetitionRepository competitionRepository;

    @Override
    public void follow(UserAccount spectator, Long competitionId) {
        assertSpectator(spectator);
        Competition competition = loadCompetition(competitionId);
        if (competitionFollowRepository.existsByUser_IdAndCompetition_Id(spectator.getId(), competitionId)) {
            return;
        }
        CompetitionFollow row = CompetitionFollow.builder()
                .user(spectator)
                .competition(competition)
                .build();
        competitionFollowRepository.save(row);
    }

    @Override
    public void unfollow(UserAccount spectator, Long competitionId) {
        assertSpectator(spectator);
        competitionFollowRepository.deleteByUser_IdAndCompetition_Id(spectator.getId(), competitionId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFollowing(UserAccount spectator, Long competitionId) {
        if (spectator == null || competitionId == null) {
            return false;
        }
        return competitionFollowRepository.existsByUser_IdAndCompetition_Id(spectator.getId(), competitionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionFollowResponse> listFollowed(UserAccount spectator) {
        assertSpectator(spectator);
        return competitionFollowRepository.findByUserIdWithCompetitionOrderByCreatedAtDesc(spectator.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void assertSpectator(UserAccount spectator) {
        if (spectator == null || !spectator.isSpectator()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Réservé aux comptes spectateur.");
        }
    }

    private Competition loadCompetition(Long competitionId) {
        if (competitionId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "competitionId est obligatoire.");
        }
        return competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compétition introuvable."));
    }

    private CompetitionFollowResponse toResponse(CompetitionFollow cf) {
        Competition c = cf.getCompetition();
        return CompetitionFollowResponse.builder()
                .competitionId(c.getId())
                .competitionName(c.getName())
                .eventId(c.getParentEvent() == null ? null : c.getParentEvent().getId())
                .eventName(c.getParentEvent() == null ? null : c.getParentEvent().getName())
                .followedAt(cf.getCreatedAt())
                .build();
    }
}
