package com.ciblorgasport.notification.api;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.admin.domain.Admin;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.dto.NotificationResponse;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("NotificationControllerIntegrationTest")
class NotificationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @Test
    void unreadCountAndReadEndpoints_shouldWorkThroughMvcStack() throws Exception {
        Admin actor = new Admin();
        actor.setEmail("integration@test.com");

        given(notificationService.getMyNotifications(org.mockito.ArgumentMatchers.any())).willReturn(List.of());
        given(notificationService.countUnread(org.mockito.ArgumentMatchers.any())).willReturn(2L);

        mockMvc.perform(get("/api/notifications/me").with(user(actor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/notifications/me/unread-count").with(user(actor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));

        mockMvc.perform(patch("/api/notifications/5/read").with(user(actor)))
                .andExpect(status().isNoContent());

        verify(notificationService).markAsRead(org.mockito.ArgumentMatchers.eq(5L), org.mockito.ArgumentMatchers.any());
    }
}
