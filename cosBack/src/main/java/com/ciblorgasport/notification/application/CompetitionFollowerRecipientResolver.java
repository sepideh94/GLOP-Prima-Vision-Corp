package com.ciblorgasport.notification.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.spectator.CompetitionFollow;
import com.ciblorgasport.spectator.infrastructure.CompetitionFollowRepository;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompetitionFollowerRecipientResolver {

    private final CompetitionFollowRepository competitionFollowRepository;

    /**
     * Spectateurs actifs suivant la compétition, avec e-mail renseigné.
     */
    public List<NotificationRecipient> resolveFollowers(Long competitionId) {
        if (competitionId == null) {
            return List.of();
        }
        return competitionFollowRepository.findByCompetitionIdWithUser(competitionId).stream()
                .map(CompetitionFollow::getUser)
                .filter(u -> u != null && u.getId() != null)
                .filter(UserAccount::isSpectator)
                .filter(UserAccount::isActive)
                .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
                .map(u -> new NotificationRecipient(u, u.getEmail(), buildDisplayName(u.getFirstName(), u.getLastName())))
                .toList();
    }

    private String buildDisplayName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isBlank() ? "spectateur" : full;
    }
}
