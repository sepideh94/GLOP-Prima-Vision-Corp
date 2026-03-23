package com.ciblorgasport.notification.api;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.admin.Admin;
import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationResponse;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.user.application.UserAccountService;

@WebMvcTest(NotificationController.class)
@Import(SecurityDisabledConfig.class)
@DisplayName("NotificationController")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private NotificationService notificationService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserAccountService userAccountService;

    @Test
    void getMyNotifications_shouldReturnList() throws Exception {
        Admin actor = new Admin();
        actor.setEmail("admin@test.com");
        given(notificationService.getMyNotifications(org.mockito.ArgumentMatchers.any()))
                .willReturn(List.of(NotificationResponse.builder()
                        .id(1L)
                        .type(NotificationType.INCIDENT)
                        .title("Incident")
                        .message("Nouveau")
                        .isRead(false)
                        .sentAt(LocalDateTime.now())
                        .build()));

        mockMvc.perform(get("/api/notifications/me").with(user(actor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Incident"));
    }

    @Test
    void countUnread_and_markRead_shouldWork() throws Exception {
        Admin actor = new Admin();
        actor.setEmail("admin@test.com");
        given(notificationService.countUnread(org.mockito.ArgumentMatchers.any())).willReturn(3L);

        mockMvc.perform(get("/api/notifications/me/unread-count").with(user(actor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3));

        mockMvc.perform(patch("/api/notifications/9/read").with(user(actor)))
                .andExpect(status().isNoContent());
        verify(notificationService).markAsRead(org.mockito.ArgumentMatchers.eq(9L), org.mockito.ArgumentMatchers.any());
    }
}
