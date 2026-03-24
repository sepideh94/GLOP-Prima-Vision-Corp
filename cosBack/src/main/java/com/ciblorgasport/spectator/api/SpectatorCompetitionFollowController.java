package com.ciblorgasport.spectator.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.spectator.application.CompetitionFollowService;
import com.ciblorgasport.spectator.dto.CompetitionFollowResponse;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

/**
 * Abonnement spectateur aux notifications liées à une compétition (incidents, résultats).
 */
@RestController
@RequestMapping("/api/spectateur/competitions")
@RequiredArgsConstructor
public class SpectatorCompetitionFollowController {

    private final CompetitionFollowService competitionFollowService;

    /**
     * S'abonner aux notifications pour une compétition.
     */
    @PostMapping("/{competitionId}/follow")
    public ResponseEntity<Void> follow(
            @AuthenticationPrincipal UserAccount currentUser,
            @PathVariable Long competitionId) {
        competitionFollowService.follow(currentUser, competitionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Se désabonner.
     */
    @DeleteMapping("/{competitionId}/follow")
    public ResponseEntity<Void> unfollow(
            @AuthenticationPrincipal UserAccount currentUser,
            @PathVariable Long competitionId) {
        competitionFollowService.unfollow(currentUser, competitionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Indique si le spectateur suit déjà cette compétition.
     */
    @GetMapping("/{competitionId}/follow")
    public ResponseEntity<FollowStatusResponse> followStatus(
            @AuthenticationPrincipal UserAccount currentUser,
            @PathVariable Long competitionId) {
        boolean following = competitionFollowService.isFollowing(currentUser, competitionId);
        return ResponseEntity.ok(new FollowStatusResponse(competitionId, following));
    }

    /**
     * Liste des compétitions suivies (ordre : abonnement le plus récent en premier).
     */
    @GetMapping("/followed")
    public ResponseEntity<List<CompetitionFollowResponse>> listFollowed(
            @AuthenticationPrincipal UserAccount currentUser) {
        return ResponseEntity.ok(competitionFollowService.listFollowed(currentUser));
    }

    public record FollowStatusResponse(Long competitionId, boolean following) {
    }
}
