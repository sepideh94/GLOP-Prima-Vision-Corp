package com.ciblorgasport.spectator.application;

import java.util.List;

import com.ciblorgasport.spectator.dto.CompetitionFollowResponse;
import com.ciblorgasport.user.domain.UserAccount;

public interface CompetitionFollowService {

    void follow(UserAccount spectator, Long competitionId);

    void unfollow(UserAccount spectator, Long competitionId);

    boolean isFollowing(UserAccount spectator, Long competitionId);

    List<CompetitionFollowResponse> listFollowed(UserAccount spectator);
}
