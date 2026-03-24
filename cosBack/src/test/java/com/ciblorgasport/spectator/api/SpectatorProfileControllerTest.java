package com.ciblorgasport.spectator.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.spectator.application.SpectatorService;
import com.ciblorgasport.spectator.domain.Spectator;
import com.ciblorgasport.spectator.dto.SpectatorTicketResponse;
import com.ciblorgasport.user.application.UserAccountService;

@WebMvcTest(SpectatorProfileController.class)
@ActiveProfiles("test")
@Import(SecurityDisabledConfig.class)
class SpectatorProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SpectatorService spectatorService;
    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private UserAccountService userAccountService;

    @Test
    void shouldUploadAndDeleteTicket() throws Exception {
        MockMultipartHttpServletRequestBuilder req = multipart("/api/spectator/profile/ticket");
        var auth = authForSpectator(50L);

        mockMvc.perform(req.file("file", "pdf-content".getBytes()).with(authentication(auth)))
                .andExpect(status().isOk());

        verify(spectatorService).uploadTicket(eq(50L), org.mockito.ArgumentMatchers.any(MultipartFile.class));

        mockMvc.perform(delete("/api/spectator/profile/ticket").with(authentication(auth)))
                .andExpect(status().isNoContent());
        verify(spectatorService).deleteTicket(50L);
    }

    @Test
    void shouldDownloadAndListTickets() throws Exception {
        var auth = authForSpectator(77L);
        when(spectatorService.downloadTicket(77L)).thenReturn(new byte[] {1, 2});
        when(spectatorService.getTicketContentType(77L)).thenReturn("application/pdf");
        when(spectatorService.getTickets(77L)).thenReturn(List.of(
                SpectatorTicketResponse.builder()
                        .id(1L)
                        .fileName("ticket.pdf")
                        .contentType("application/pdf")
                        .fileSize(10L)
                        .uploadedAt(LocalDateTime.now())
                        .active(true)
                        .build()
        ));

        mockMvc.perform(get("/api/spectator/profile/ticket").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"ticket\""));

        mockMvc.perform(get("/api/spectator/profile/tickets").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].active").value(true));
    }

    @Test
    void shouldHandleTicketByIdEndpoints() throws Exception {
        var auth = authForSpectator(9L);
        when(spectatorService.downloadTicketById(9L, 3L)).thenReturn(new byte[] {3});
        when(spectatorService.getTicketContentTypeById(9L, 3L)).thenReturn("image/png");

        mockMvc.perform(get("/api/spectator/profile/tickets/3").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"ticket-3\""));

        mockMvc.perform(delete("/api/spectator/profile/tickets/3").with(authentication(auth)))
                .andExpect(status().isNoContent());

        verify(spectatorService).deleteTicketById(9L, 3L);
    }

    private UsernamePasswordAuthenticationToken authForSpectator(Long id) {
        Spectator spectator = Spectator.builder()
                .id(id)
                .email("spectator@test.com")
                .password("pwd")
                .isActive(true)
                .build();
        return new UsernamePasswordAuthenticationToken(spectator, "pwd", spectator.getAuthorities());
    }
}
