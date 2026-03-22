package com.ciblorgasport.spectator.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.common.exception.GlobalExceptionHandler;
import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.spectator.Spectator;
import com.ciblorgasport.spectator.application.CompetitionFollowService;
import com.ciblorgasport.spectator.dto.CompetitionFollowResponse;
import com.ciblorgasport.user.application.UserAccountService;

@WebMvcTest(SpectatorCompetitionFollowController.class)
@Import({SecurityDisabledConfig.class, GlobalExceptionHandler.class})
@DisplayName("SpectatorCompetitionFollowController")
class SpectatorCompetitionFollowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CompetitionFollowService competitionFollowService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserAccountService userAccountService;

    @Test
    void postFollowDelegatesToService() throws Exception {
        Spectator spec = spectatorPrincipal(5L);
        mockMvc.perform(post("/api/spectateur/competitions/12/follow")
                        .with(authentication(token(spec)))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
        verify(competitionFollowService).follow(eq(spec), eq(12L));
    }

    @Test
    void deleteUnfollowDelegatesToService() throws Exception {
        Spectator spec = spectatorPrincipal(5L);
        mockMvc.perform(delete("/api/spectateur/competitions/12/follow")
                        .with(authentication(token(spec))))
                .andExpect(status().isNoContent());
        verify(competitionFollowService).unfollow(eq(spec), eq(12L));
    }

    @Test
    void getFollowStatusReturnsJson() throws Exception {
        Spectator spec = spectatorPrincipal(5L);
        when(competitionFollowService.isFollowing(spec, 12L)).thenReturn(true);
        mockMvc.perform(get("/api/spectateur/competitions/12/follow")
                        .with(authentication(token(spec))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.competitionId").value(12))
                .andExpect(jsonPath("$.following").value(true));
    }

    @Test
    void getFollowedReturnsList() throws Exception {
        Spectator spec = spectatorPrincipal(5L);
        when(competitionFollowService.listFollowed(spec)).thenReturn(List.of(
                CompetitionFollowResponse.builder()
                        .competitionId(3L)
                        .competitionName("Judo")
                        .eventId(1L)
                        .eventName("JO")
                        .followedAt(LocalDateTime.parse("2025-06-01T10:00:00"))
                        .build()
        ));
        mockMvc.perform(get("/api/spectateur/competitions/followed")
                        .with(authentication(token(spec))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].competitionId").value(3))
                .andExpect(jsonPath("$[0].competitionName").value("Judo"));
    }

    private static Spectator spectatorPrincipal(Long id) {
        return Spectator.builder()
                .id(id)
                .email("spec@test.com")
                .firstName("S")
                .lastName("P")
                .build();
    }

    private static Authentication token(Spectator spec) {
        return new UsernamePasswordAuthenticationToken(
                spec,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_SPECTATOR"))
        );
    }
}
